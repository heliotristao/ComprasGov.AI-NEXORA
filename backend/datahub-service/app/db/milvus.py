import os
from pymilvus import connections, utility

MILVUS_HOST = os.environ.get("MILVUS_HOST", "localhost")
MILVUS_PORT = os.environ.get("MILVUS_PORT", "19530")

def get_milvus_connection():
    """Establishes a connection to the Milvus server."""
    try:
        connections.connect(alias="default", host=MILVUS_HOST, port=MILVUS_PORT)
        print(f"Successfully connected to Milvus at {MILVUS_HOST}:{MILVUS_PORT}")
    except Exception as e:
        print(f"Failed to connect to Milvus: {e}")
        raise

def close_milvus_connection():
    """Closes the connection to the Milvus server."""
    try:
        connections.disconnect(alias="default")
        print("Successfully disconnected from Milvus.")
    except Exception as e:
        print(f"Failed to disconnect from Milvus: {e}")

def check_and_create_collection(collection_name: str, dim: int):
    """Checks if a collection exists, and creates it if it doesn't."""
    if not utility.has_collection(collection_name):
        from pymilvus import Collection, FieldSchema, CollectionSchema, DataType

        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="artifact_version_id", dtype=DataType.INT64),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim)
        ]
        schema = CollectionSchema(fields, description="Artifact Embeddings")
        collection = Collection(name=collection_name, schema=schema)

        # Create an index for the embedding field
        index_params = {
            "metric_type": "L2",
            "index_type": "IVF_FLAT",
            "params": {"nlist": 1024}
        }
        collection.create_index(field_name="embedding", index_params=index_params)
        print(f"Collection '{collection_name}' created and index built.")
    else:
        print(f"Collection '{collection_name}' already exists.")
