import os
import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error
from sqlalchemy import create_engine
from dotenv import load_dotenv
import pickle
import sys

# Add the application's root directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def train_model():
    """
    Trains a LightGBM model on the market price data and saves the entire pipeline.
    """
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set.")

    engine = create_engine(database_url)
    df = pd.read_sql("SELECT * FROM market_prices", engine)

    if df.empty:
        print("No data found in the market_prices table. Exiting.")
        return

    # Feature Engineering for date
    df['purchase_date'] = pd.to_datetime(df['purchase_date'])
    df['year'] = df['purchase_date'].dt.year
    df['month'] = df['purchase_date'].dt.month
    df['day'] = df['purchase_date'].dt.day

    # Define features and target
    features = ['item_description', 'quantity', 'year', 'month', 'day']
    target = 'unit_value'

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Create a preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('text', TfidfVectorizer(max_features=100), 'item_description'),
            ('numeric', 'passthrough', ['quantity', 'year', 'month', 'day'])
        ],
        remainder='drop'  # Ignore other columns like category and region
    )

    # Create the full model pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', lgb.LGBMRegressor(random_state=42))
    ])

    # Train model
    pipeline.fit(X_train, y_train)

    # Evaluate model
    y_pred = pipeline.predict(X_test)
    rmse = mean_squared_error(y_test, y_pred, squared=False)
    print(f"RMSE: {rmse}")

    # Save the entire pipeline to a single file
    pipeline_path = os.path.join(os.path.dirname(__file__), '..', 'app', 'ml', 'models', 'price_pipeline.pkl')
    with open(pipeline_path, 'wb') as f:
        pickle.dump(pipeline, f)

    return rmse

if __name__ == "__main__":
    train_model()
