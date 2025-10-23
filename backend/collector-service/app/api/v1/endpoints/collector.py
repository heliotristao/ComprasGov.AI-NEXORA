from fastapi import APIRouter
from app.scrapers.pncp_scraper import scrape_pncp

router = APIRouter()

@router.post("/collect/pncp")
async def collect_pncp_data():
    """
    Triggers the PNCP scraper and returns the number of collected items.
    """
    collected_items = await scrape_pncp()
    return {"collected_items_count": len(collected_items)}
