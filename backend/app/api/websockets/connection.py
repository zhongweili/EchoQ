import json
from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, event_id: str) -> None:
        if event_id not in self._connections:
            self._connections[event_id] = set()
        self._connections[event_id].add(websocket)

    def disconnect(self, websocket: WebSocket, event_id: str) -> None:
        if event_id in self._connections:
            self._connections[event_id].discard(websocket)
            if not self._connections[event_id]:
                del self._connections[event_id]

    def _serialize(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, UUID):
            return str(obj)
        if hasattr(obj, "model_dump"):
            return obj.model_dump()
        raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

    async def broadcast(self, event_id: str, message: dict[str, Any]) -> None:
        if event_id not in self._connections:
            return

        try:
            json_message = json.dumps(message, default=self._serialize)
        except Exception as e:
            print(f"Error serializing message: {e}")
            return

        dead_connections = set()
        for connection in list(self._connections[event_id]):
            try:
                await connection.send_text(json_message)
            except Exception:
                dead_connections.add(connection)

        for dead in dead_connections:
            self._connections[event_id].discard(dead)

        if not self._connections[event_id]:
            del self._connections[event_id]


manager = ConnectionManager()
