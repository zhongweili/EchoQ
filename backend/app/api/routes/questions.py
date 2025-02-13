from uuid import UUID

from fastapi import APIRouter, HTTPException, Query
from sqlmodel import desc, func, select

from app.api.deps import SessionDep
from app.models import (
    Event,
    Question,
    QuestionCreate,
    QuestionPublic,
    QuestionsPublic,
    QuestionUpdate,
)

from ..websockets.connection import manager

router = APIRouter(prefix="/questions", tags=["questions"])


async def verify_event(session: SessionDep, event_id: UUID) -> Event:
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


async def get_question_or_404(
    session: SessionDep, event_id: UUID, question_id: UUID
) -> Question:
    question = session.get(Question, question_id)
    if not question or question.event_id != event_id:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


def build_questions_query(
    event_id: UUID, parent_id: UUID | None, sort_by: str | None, order: str
):
    query = select(Question).where(Question.event_id == event_id)

    if parent_id is not None:
        query = query.where(Question.parent_id == parent_id)
    else:
        query = query.where(Question.parent_id.is_(None))

    if sort_by == "likes":
        query = query.order_by(
            desc(Question.like_count) if order == "desc" else Question.like_count
        )
    else:
        query = query.order_by(
            desc(Question.inserted_at) if order == "desc" else Question.inserted_at
        )

    return query


@router.get("/events/{event_id}/questions", response_model=QuestionsPublic)
async def list_questions(
    event_id: UUID,
    session: SessionDep,
    sort_by: str | None = Query(None, enum=["created_at", "likes"]),
    order: str | None = Query("desc", enum=["asc", "desc"]),
    parent_id: UUID | None = None,
):
    await verify_event(session, event_id)

    # Build and execute query
    query = build_questions_query(event_id, parent_id, sort_by, order)
    questions = session.exec(query).all()

    # Get total count
    count_statement = (
        select(func.count()).select_from(Question).where(Question.event_id == event_id)
    )
    if parent_id is not None:
        count_statement = count_statement.where(Question.parent_id == parent_id)
    else:
        count_statement = count_statement.where(Question.parent_id.is_(None))
    count = session.exec(count_statement).one()

    # Update followup counts
    for question in questions:
        followup_count = session.exec(
            select(func.count())
            .select_from(Question)
            .where(Question.parent_id == question.id, Question.event_id == event_id)
        ).one()
        question.followup_count = followup_count

    return QuestionsPublic(data=questions, count=count)


@router.post("/events/{event_id}/questions", response_model=QuestionPublic)
async def create_question(
    event_id: UUID,
    session: SessionDep,
    question_in: QuestionCreate,
    user_name: str,
    attendee_identifier: str,
    parent_id: UUID | None = None,
):
    await verify_event(session, event_id)

    if parent_id:
        parent = await get_question_or_404(session, event_id, parent_id)
        parent.followup_count += 1

    question = Question(
        **question_in.model_dump(),
        event_id=event_id,
        parent_id=parent_id,
        user_name=user_name,
        attendee_identifier=attendee_identifier,
    )
    session.add(question)
    session.commit()
    session.refresh(question)

    # Broadcast updates
    if parent_id:
        await manager.broadcast(
            str(event_id),
            {
                "type": "question_updated",
                "data": {
                    "id": str(parent_id),
                    "followup_count": parent.followup_count,
                },
            },
        )

    await manager.broadcast(
        str(event_id),
        {
            "type": "new_question",
            "data": {
                **question.model_dump(),
                "userName": user_name,
            },
        },
    )
    return question


@router.put("/events/{event_id}/questions/{id}", response_model=QuestionPublic)
async def update_question(
    event_id: UUID,
    id: UUID,
    session: SessionDep,
    question_in: QuestionUpdate,
    attendee_identifier: str,
):
    question = await get_question_or_404(session, event_id, id)

    if question.attendee_identifier != attendee_identifier:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this question"
        )

    for key, value in question_in.model_dump(exclude_unset=True).items():
        setattr(question, key, value)

    session.commit()
    session.refresh(question)
    return question


@router.get("/events/{event_id}/questions/{id}", response_model=QuestionPublic)
async def get_question(event_id: UUID, id: UUID, session: SessionDep):
    return await get_question_or_404(session, event_id, id)


@router.delete("/events/{event_id}/questions/{id}")
async def delete_question(
    event_id: UUID,
    id: UUID,
    session: SessionDep,
    attendee_identifier: str,
):
    question = await get_question_or_404(session, event_id, id)

    if question.attendee_identifier != attendee_identifier:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this question"
        )

    session.delete(question)
    session.commit()
    return {"message": "Question deleted"}


@router.post("/events/{event_id}/questions/{id}/like")
async def like_question(event_id: UUID, id: UUID, session: SessionDep):
    question = await get_question_or_404(session, event_id, id)

    question.like_count += 1

    # Get followup count
    followup_count = session.exec(
        select(func.count())
        .select_from(Question)
        .where(Question.parent_id == question.id, Question.event_id == event_id)
    ).one()
    question.followup_count = followup_count

    session.commit()
    session.refresh(question)

    await manager.broadcast(
        str(event_id),
        {
            "type": "question_liked",
            "data": {
                "id": str(id),
                "like_count": question.like_count,
                "likes": question.like_count,
                "followup_count": question.followup_count,
            },
        },
    )
    return question
