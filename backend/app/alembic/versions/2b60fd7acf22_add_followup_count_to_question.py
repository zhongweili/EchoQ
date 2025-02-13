"""add followup_count to question

Revision ID: 2b60fd7acf22
Revises: c056988fac21
Create Date: 2024-01-xx xx:xx:xx.xxxxxx

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '2b60fd7acf22'
down_revision: Union[str, None] = 'c056988fac21'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. 添加可为空的列
    op.add_column('question', sa.Column('followup_count', sa.Integer(), nullable=True))

    # 2. 更新现有记录，设置默认值为0
    op.execute(text("UPDATE question SET followup_count = 0 WHERE followup_count IS NULL"))

    # 3. 将列设置为非空
    op.alter_column('question', 'followup_count',
                    existing_type=sa.Integer(),
                    nullable=False,
                    server_default='0')


def downgrade() -> None:
    op.drop_column('question', 'followup_count')
