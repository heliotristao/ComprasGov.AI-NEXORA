import pytest
from unittest.mock import patch
from uuid import uuid4
import numpy as np
from app.services import catalog_service
from app.models import Artifact, ArtifactIndex, DocType


def test_index_artifact(db):
    # 1. Create a dummy artifact
    artifact = Artifact(
        id=uuid4(),
        process_id="test_process",
        doc_type=DocType.ETP,
        org_id="test_org",
        author_id="test_author",
        version=1,
        filename="test.json",
        s3_key="test/key.json",
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)

    # 2. Mock the embedding generation
    with patch(
        "app.services.catalog_service.generate_embedding",
        return_value=np.array([0.2] * 1536),
    ):
        # 3. Call the index_artifact function
        catalog_service._index_artifact_with_db(db, artifact.id)

    # 4. Verify that the ArtifactIndex was created
    artifact_index = (
        db.query(ArtifactIndex)
        .filter(ArtifactIndex.artifact_id == artifact.id)
        .first()
    )
    assert artifact_index is not None
    assert artifact_index.embedding == pytest.approx(np.array([0.2] * 1536))
    assert artifact_index.summary == '{"content": "This is a test JSON file."}'
