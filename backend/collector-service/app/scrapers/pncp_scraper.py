import httpx
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.models.market_price import MarketPrice


async def scrape_pncp(db: Session):
    """
    Scrapes the PNCP API to collect procurement data and saves it to the
    database.
    """
    collected_items = []
    base_url = "https://pncp.gov.br/api/consulta"

    # Get today's date in the required format
    today = datetime.now()
    start_date = today - timedelta(days=1)
    start_date_filter = start_date.strftime('%Y%m%d')
    end_date_filter = today.strftime('%Y%m%d')

    async with httpx.AsyncClient(timeout=30.0) as client:
        # First, find recent procurements
        try:
            search_response = await client.get(
                f"{base_url}/v1/contratacoes/publicacao",
                params={
                    "dataInicial": start_date_filter,
                    "dataFinal": end_date_filter,
                    "codigoModalidadeContratacao": 8,
                    "pagina": 1
                }
            )
            search_response.raise_for_status()
            procurements = search_response.json().get('data', [])
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            print(f"Error fetching procurements: {e}")
            return 0

        # For each procurement, get its details
        for procurement in procurements:
            try:
                cnpj = procurement.get('orgaoEntidade', {}).get('cnpj')
                ano = procurement.get('ano')
                sequencial = procurement.get('sequencial')

                if not all([cnpj, ano, sequencial]):
                    continue

                details_response = await client.get(
                    f"{base_url}/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}"
                )
                details_response.raise_for_status()
                details = details_response.json()

                # Extract item details
                for item in details.get('itens', []):
                    purchase_date = datetime.strptime(
                        details.get('dataPublicacao'), '%Y-%m-%dT%H:%M:%S'
                    ).date()
                    collected_items.append({
                        "item_description": item.get('descricao'),
                        "quantity": item.get('quantidade'),
                        "unit_value": item.get('valorUnitario'),
                        "purchase_date": purchase_date,
                        "source": "PNCP"
                    })
            except (httpx.RequestError, httpx.HTTPStatusError) as e:
                print(
                    f"Error fetching details for {procurement.get('id')}: {e}")
                continue  # Move to the next procurement

    if collected_items:
        db.bulk_insert_mappings(MarketPrice, collected_items)
        db.commit()

    return len(collected_items)

if __name__ == '__main__':
    async def main():
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            count = await scrape_pncp(db)
            print(f"Collected and saved {count} items.")
        finally:
            db.close()

    asyncio.run(main())
