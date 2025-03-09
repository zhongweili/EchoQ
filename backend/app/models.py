import uuid
from datetime import datetime, timezone

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


class TimestampModel(SQLModel):
    inserted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, TimestampModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    events: list["Event"] = Relationship(back_populates="owner")
    posts: list["Post"] = Relationship(back_populates="user")


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, TimestampModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class EventBase(SQLModel):
    name: str
    audience_peak: int = 0
    started_at: datetime | None = None
    expired_at: datetime | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    pass


# Properties to return via API, id is always required
class EventPublic(EventBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    code: str

    model_config = {"from_attributes": True}


class EventsPublic(SQLModel):
    data: list[EventPublic]
    count: int


class Event(EventBase, TimestampModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="events")
    posts: list["Post"] = Relationship(back_populates="event")
    name: str = Field(max_length=255)
    code: str = Field(max_length=255)
    audience_peak: int = 0
    started_at: datetime | None = None
    expired_at: datetime | None = None
    questions: list["Question"] = Relationship(back_populates="event")


class PostBase(SQLModel):
    body: str
    name: str = Field(max_length=255)
    attendee_identifier: str = Field(max_length=255)
    position: int = 0
    pinned: bool = False


class PostCreate(PostBase):
    pass


class PostUpdate(PostBase):
    pass


class Post(PostBase, TimestampModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    body: str
    name: str = Field(max_length=255)
    attendee_identifier: str = Field(max_length=255)
    position: int = 0
    pinned: bool = False
    like_count: int = 0
    lol_count: int = 0
    parent_id: uuid.UUID | None = Field(default=None, foreign_key="post.id")
    event_id: uuid.UUID = Field(foreign_key="event.id")
    event: Event | None = Relationship(back_populates="posts")
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User | None = Relationship(back_populates="posts")


class QuestionBase(SQLModel):
    title: str | None = Field(default=None, max_length=255)
    content: str
    position: int = 0
    pinned: bool = False
    like_count: int = Field(default=0)
    followup_count: int = Field(default=0)


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(QuestionBase):
    title: str | None = Field(default=None, max_length=255)
    content: str = ""
    position: int = 0
    pinned: bool = False


class QuestionPublic(QuestionBase):
    id: uuid.UUID
    event_id: uuid.UUID
    parent_id: uuid.UUID | None
    like_count: int
    inserted_at: datetime
    user_name: str | None = None
    attendee_identifier: str | None = None

    model_config = {"from_attributes": True}


class QuestionsPublic(SQLModel):
    data: list[QuestionPublic]
    count: int


class Question(QuestionBase, TimestampModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_name: str | None = Field(default=None, max_length=255)
    attendee_identifier: str | None = Field(default=None, max_length=255)
    event_id: uuid.UUID = Field(foreign_key="event.id")
    event: Event = Relationship(back_populates="questions")
    parent_id: uuid.UUID | None = Field(default=None, foreign_key="question.id")
    title: str | None = Field(default=None, max_length=255)
    content: str
    position: int = 0
    pinned: bool = False
    like_count: int = 0
    followup_count: int = 0
