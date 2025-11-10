from __future__ import annotations

import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

from app.graphql.query import Query


schema = strawberry.Schema(query=Query)


def create_app() -> FastAPI:
    app = FastAPI(title="NEXORA Unified Backend")

    graphql_app = GraphQLRouter(schema, graphiql=True)
    app.include_router(graphql_app, prefix="/graphql")

    @app.get("/health", tags=["infra"])
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
