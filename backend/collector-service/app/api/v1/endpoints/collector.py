from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.scrapers.pncp_scraper import scrape_pncp
from app.db.session import SessionLocal

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/collect/pncp")
async def collect_pncp_data(db: Session = Depends(get_db)):
    """
    Triggers the PNCP scraper and returns the number of collected items.
    """
    saved_items_count = await scrape_pncp(db)
    return {"saved_items_count": saved_items_count}
