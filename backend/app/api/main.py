from fastapi import APIRouter

from app.api.routes import (
    events,
    items,
    login,
    private,
    questions,
    users,
    utils,
    websockets,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(events.router)
api_router.include_router(questions.router)
api_router.include_router(websockets.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
