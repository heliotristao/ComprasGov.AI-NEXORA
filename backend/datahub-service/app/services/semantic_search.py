from pymilvus import Collection
from app.db.milvus import check_and_create_collection
import numpy as np

COLLECTION_NAME = "nexora_artifacts"
EMBEDDING_DIM = 768  # Example dimension for a generic sentence transformer

class SemanticSearchService:
    def __init__(self):
        check_and_create_collection(COLLECTION_NAME, EMBEDDING_DIM)
        self.collection = Collection(COLLECTION_NAME)
        self.collection.load()

    def _generate_embedding(self, text: str) -> list[float]:
        """Placeholder for a real embedding model."""
        # In a real implementation, this would call out to an AI engine service
        # or use a local sentence transformer model.
        print(f"Generating dummy embedding for text: '{text[:30]}...'")
        return np.random.rand(EMBEDDING_DIM).tolist()

    def add_document(self, artifact_version_id: int, text_content: str):
        """Generates embedding and inserts a document into Milvus."""
        embedding = self._generate_embedding(text_content)
        data = [
            [artifact_version_id],
            [embedding]
        ]
        self.collection.insert(data)
        print(f"Inserted document for artifact version {artifact_version_id} into Milvus.")
        self.collection.flush() # Ensure data is indexed

    def search(self, query_text: str, top_k: int = 5) -> list[dict]:
        """Performs a semantic search for similar documents."""
        query_embedding = self._generate_embedding(query_text)

        search_params = {
            "metric_type": "L2",
            "params": {"nprobe": 10},
        }

        results = self.collection.search(
            data=[query_embedding],
            anns_field="embedding",
            param=search_params,
            limit=top_k,
            output_fields=["artifact_version_id"]
        )

        search_results = []
        for hit in results[0]:
            search_results.append({
                "artifact_version_id": hit.entity.get("artifact_version_id"),
                "score": hit.distance
            })

        return search_results

# Singleton instance
search_service = SemanticSearchService()
