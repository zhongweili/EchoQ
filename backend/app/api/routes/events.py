from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Event, EventCreate, EventPublic, EventsPublic, EventUpdate
from app.utils import generate_event_code

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=EventsPublic)
async def list_events(session: SessionDep, current_user: CurrentUser):
    """List all events"""
    # First get count
    count_statement = (
        select(func.count()).select_from(Event).where(Event.owner_id == current_user.id)
    )
    count = session.exec(count_statement).one()

    # Then get events with explicit column selection
    statement = select(Event).where(Event.owner_id == current_user.id)
    events = session.exec(statement).all()
    return EventsPublic(data=events, count=count)


@router.post("/", response_model=EventPublic)
async def new_event(
    session: SessionDep, current_user: CurrentUser, event_in: EventCreate
):
    """Create new event"""
    event = Event(
        **event_in.model_dump(),
        owner_id=current_user.id,
        code=generate_event_code(event_in.name),
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


@router.put("/{id}/edit", response_model=EventPublic)
async def edit_event(
    id: UUID, session: SessionDep, current_user: CurrentUser, event_in: EventUpdate
):
    """Edit event form"""
    event = session.exec(select(Event).where(Event.id == id)).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")

    for key, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, key, value)

    session.commit()
    session.refresh(event)
    return event


@router.get("/{id}", response_model=EventPublic)
async def get_event(id: UUID, session: SessionDep):
    """Get event"""
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.get("/{id}/stats")
async def event_stats(id: int, session: SessionDep):
    """Get event statistics"""
    event = session.get(Event, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return HTTPException(status_code=200, detail="Event stats not implemented")


@router.post("/{uuid}/slide.jpg")
async def generate_slide():
    """Generate slide image"""
    return HTTPException(status_code=200, detail="Slide image not implemented")
