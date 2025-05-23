"""add envent and post tables

Revision ID: 177099392d6e
Revises: 1a31ce608336
Create Date: 2025-02-03 21:31:33.964356

"""
from datetime import datetime, timezone
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '177099392d6e'
down_revision = '1a31ce608336'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('event',
    sa.Column('inserted_at', sa.DateTime(), nullable=False, default=datetime.now(timezone.utc)),
    sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.now(timezone.utc)),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('code', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('audience_peak', sa.Integer(), nullable=False),
    sa.Column('started_at', sa.DateTime(), nullable=True),
    sa.Column('expired_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('post',
    sa.Column('inserted_at', sa.DateTime(), nullable=False, default=datetime.now(timezone.utc)),
    sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.now(timezone.utc)),
    sa.Column('body', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('attendee_identifier', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('pinned', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('like_count', sa.Integer(), nullable=False),
    sa.Column('lol_count', sa.Integer(), nullable=False),
    sa.Column('parent_id', sa.Uuid(), nullable=True),
    sa.Column('event_id', sa.Uuid(), nullable=False),
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['event.id'], ),
    sa.ForeignKeyConstraint(['parent_id'], ['post.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.add_column('item', sa.Column('inserted_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False))
    op.add_column('item', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False))
    op.add_column('user', sa.Column('inserted_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False))
    op.add_column('user', sa.Column('updated_at', sa.DateTime(), server_default=sa.text('NOW()'), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'updated_at')
    op.drop_column('user', 'inserted_at')
    op.drop_column('item', 'updated_at')
    op.drop_column('item', 'inserted_at')
    op.drop_table('post')
    op.drop_table('event')
    # ### end Alembic commands ###
