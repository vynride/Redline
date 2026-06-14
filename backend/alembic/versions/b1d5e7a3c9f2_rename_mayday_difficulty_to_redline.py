"""rename mayday difficulty tier to redline

Revision ID: b1d5e7a3c9f2
Revises: 6789f18ae13c
Create Date: 2026-06-13 00:00:00.000000

Rebrand: the hardest difficulty tier was renamed from "mayday" to "redline".
This updates the authoritative ``drill_sessions.difficulty`` column as well as
the denormalised scenario JSON snapshots that embed difficulty values.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b1d5e7a3c9f2'
down_revision: Union[str, None] = '6789f18ae13c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# (json column owner table, column) pairs holding embedded difficulty values.
_JSON_COLUMNS = [
    ("drill_sessions", "scenario_json"),
    ("generated_scenarios", "scenario_json"),
]


def _json_text_swap(table: str, column: str, a: str, b: str) -> None:
    """Replace casing-aware brand tokens inside a JSON column, both dialects."""
    conn = op.get_bind()
    if conn.dialect.name == "postgresql":
        expr = f"{column}::text"
        cast_back = "::json"
        like_col = f"{column}::text"
    else:  # sqlite (and others) store JSON as plain text
        expr = column
        cast_back = ""
        like_col = column
    repl = (
        f"replace(replace(replace({expr},"
        f"'{a.upper()}','{b.upper()}'),"
        f"'{a.capitalize()}','{b.capitalize()}'),"
        f"'{a}','{b}')"
    )
    conn.execute(
        sa.text(
            f"UPDATE {table} SET {column} = {repl}{cast_back} "
            f"WHERE {like_col} LIKE '%ayday%'"
        )
        if a == "mayday"
        else sa.text(
            f"UPDATE {table} SET {column} = {repl}{cast_back} "
            f"WHERE {like_col} LIKE '%edline%'"
        )
    )


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "UPDATE drill_sessions SET difficulty='redline' "
            "WHERE difficulty='mayday'"
        )
    )
    for table, column in _JSON_COLUMNS:
        _json_text_swap(table, column, "mayday", "redline")


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            "UPDATE drill_sessions SET difficulty='mayday' "
            "WHERE difficulty='redline'"
        )
    )
    for table, column in _JSON_COLUMNS:
        _json_text_swap(table, column, "redline", "mayday")
