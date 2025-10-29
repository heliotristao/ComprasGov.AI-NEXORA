from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session as SQLAlchemySession
from sqlalchemy import text


_original_execute = SQLAlchemySession.execute


def _execute_with_text(session: SQLAlchemySession, statement, *args, **kwargs):
    if isinstance(statement, str):
        statement = text(statement)
    return _original_execute(session, statement, *args, **kwargs)


SQLAlchemySession.execute = _execute_with_text

Base = declarative_base()
from app.models.plan import Plan
