import httpx
import asyncio
from datetime import datetime, timedelta

async def scrape_pncp():
    """
    Scrapes the PNCP API to collect procurement data.
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
            return []

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
                    collected_items.append({
                        "descricao": item.get('descricao'),
                        "quantidade": item.get('quantidade'),
                        "valor_unitario": item.get('valorUnitario'),
                        "data_compra": details.get('dataPublicacao')
                    })
            except (httpx.RequestError, httpx.HTTPStatusError) as e:
                print(f"Error fetching details for {procurement.get('id')}: {e}")
                continue # Move to the next procurement

    return collected_items

if __name__ == '__main__':
    async def main():
        data = await scrape_pncp()
        print(f"Collected {len(data)} items.")
        if data:
            print("First item:", data[0])
    asyncio.run(main())
