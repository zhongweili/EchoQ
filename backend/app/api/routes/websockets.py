from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..websockets.connection import manager

router = APIRouter(tags=["websockets"])


@router.websocket("/ws/events/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str) -> None:
    try:
        await websocket.accept()
        await manager.connect(websocket, event_id)
        while True:
            try:
                data = await websocket.receive_text()
                if data == "ping":
                    await websocket.send_text("pong")
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                break
    finally:
        manager.disconnect(websocket, event_id)
