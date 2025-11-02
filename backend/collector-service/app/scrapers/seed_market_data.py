import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from app.db.models.market_price import MarketPrice
from app.db.session import SessionLocal

fake = Faker('pt_BR')

# Configuration
NUM_RECORDS = 1100
START_DATE = datetime.now() - timedelta(days=365)
END_DATE = datetime.now()

# Sample data pools for variety
ITEM_CATEGORIES = {
    "Material de Escritório": ["Caneta Esferográfica", "Papel A4", "Toner para Impressora", "Grampeador", "Clipes de Papel"],
    "Equipamentos de TI": ["Mouse Óptico", "Teclado ABNT2", "Monitor LED 24\"", "Notebook Core i5", "HD Externo 1TB"],
    "Mobiliário": ["Cadeira de Escritório Ergonômica", "Mesa de Reunião", "Armário Baixo com Chave", "Estação de Trabalho"],
    "Serviços de Limpeza": ["Serviço de Limpeza Predial (m²)", "Kit de Limpeza", "Desinfetante Hospitalar (Litro)"],
    "Copa e Cozinha": ["Café em Pó (1kg)", "Açúcar Refinado (1kg)", "Copo Descartável (100 un.)", "Garrafa Térmica 5L"]
}

SOURCES = ["PNCP", "BLL Compras", "BEC SP"]

def get_random_item():
    """Selects a random category and a random item from it."""
    category = random.choice(list(ITEM_CATEGORIES.keys()))
    item_description = random.choice(ITEM_CATEGORIES[category])
    return category, item_description

def generate_seed_data(num_records: int) -> list[dict]:
    """Generates a list of market price records."""
    records = []
    for _ in range(num_records):
        category, item_desc = get_random_item()

        # Determine a realistic price range based on category
        if category == "Equipamentos de TI" or category == "Mobiliário":
            unit_value = round(random.uniform(150.0, 3500.0), 2)
        elif category == "Serviços de Limpeza":
            unit_value = round(random.uniform(15.0, 200.0), 2)
        else:
            unit_value = round(random.uniform(2.50, 100.0), 2)

        record = {
            "item_description": item_desc,
            "quantity": random.randint(1, 200),
            "unit_value": unit_value,
            "purchase_date": fake.date_between(start_date=START_DATE, end_date=END_DATE),
            "source": random.choice(SOURCES)
        }
        records.append(record)
    return records

def seed_market_data(db: Session, num_records: int = NUM_RECORDS):
    """
    Seeds the database with a specified number of market price records.
    """
    print(f"Generating {num_records} seed records for market prices...")

    # Check if data already exists to prevent re-seeding
    count = db.query(MarketPrice).count()
    if count >= num_records:
        print(f"Database already contains {count} records. Seeding is not required.")
        return 0

    records_to_add = num_records - count
    if records_to_add <= 0:
        print("Sufficient data already exists.")
        return 0

    print(f"Adding {records_to_add} new records to the database.")

    data = generate_seed_data(records_to_add)

    # Bulk insert for performance
    db.bulk_insert_mappings(MarketPrice, data)
    db.commit()

    return len(data)

def main():
    """Main function to run the seeding process."""
    db = SessionLocal()
    try:
        count = seed_market_data(db)
        if count > 0:
            print(f"Successfully inserted {count} new market price records.")
        else:
            print("No new records were added.")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting market data seeding script...")
    main()
