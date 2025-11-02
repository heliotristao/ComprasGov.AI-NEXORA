import logging
import hashlib
import time
import asyncio
from datetime import datetime, timezone
from celery import shared_task
from prometheus_client import Counter, Histogram
from app.db.session import SessionLocal
from app import crud
from app.db.models.etp_consolidation_job import ETPConsolidationJob
from app.clients.datahub_client import datahub_client
from app.services.etp_document_generator import generate_etp_docx # Assuming this service exists

# --- Prometheus Metrics ---
ETP_CONSOLIDATION_JOBS_TOTAL = Counter(
    "etp_consolidation_jobs_total",
    "Total number of ETP consolidation jobs",
    ["status"],
)
ETP_CONSOLIDATION_DURATION_SECONDS = Histogram(
    "etp_consolidation_duration_seconds",
    "Duration of ETP consolidation jobs in seconds",
)
ETP_ARTIFACT_BYTES_TOTAL = Counter(
    "etp_artifact_bytes_total",
    "Total bytes of generated ETP artifacts",
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def consolidate_etp_task(self, job_id: str, etp_id: str, user_id: str):
    """
    Asynchronous task to consolidate an ETP into DOCX and PDF artifacts.
    """
    logger.info(f"[AUDIT] ETP_CONSOLIDATION_START for job_id: {job_id}, etp_id: {etp_id}")
    ETP_CONSOLIDATION_JOBS_TOTAL.labels(status="running").inc()

    db = SessionLocal()
    job = None
    start_time = time.time()

    try:
        job = db.query(ETPConsolidationJob).filter(ETPConsolidationJob.job_id == job_id).first()
        if not job:
            logger.error(f"Job with job_id: {job_id} not found.")
            ETP_CONSOLIDATION_JOBS_TOTAL.labels(status="error").inc()
            return

        etp = crud.etp.get(db, id=etp_id)
        if not etp:
            raise ValueError("ETP not found")

        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        db.commit()

        # 1. Generate DOCX content
        docx_content = generate_etp_docx(etp.data)
        ETP_ARTIFACT_BYTES_TOTAL.inc(len(docx_content))

        # 2. Calculate SHA1 checksum
        checksum_sha1 = hashlib.sha1(docx_content).hexdigest()

        # 3. Upload to DataHub
        filename = f"ETP_{etp.id}_v{etp.version + 1}.docx"
        upload_response = datahub_client.upload_artifact(
            file_content=docx_content,
            filename=filename,
            etp_id=str(etp.id),
            version=etp.version + 1,
            checksum_sha1=checksum_sha1
        )

        if not upload_response or "id" not in upload_response:
            raise Exception("Failed to upload artifact to DataHub")

        # 4. Update job and ETP
        job.status = "done"
        job.finished_at = datetime.now(timezone.utc)
        job.checksum_sha1 = checksum_sha1
        job.artifact_id = upload_response["id"]
        etp.version += 1 # Increment ETP version

        db.commit()

        ETP_CONSOLIDATION_JOBS_TOTAL.labels(status="done").inc()
        logger.info(f"[AUDIT] ETP_CONSOLIDATION_COMPLETE for job_id: {job_id}")

    except Exception as e:
        logger.error(f"Error consolidating ETP for job_id: {job_id}: {e}", exc_info=True)
        if job:
            job.status = "error"
            job.error_log = str(e)
            job.finished_at = datetime.now(timezone.utc)
            db.commit()
        ETP_CONSOLIDATION_JOBS_TOTAL.labels(status="error").inc()
    finally:
        duration = time.time() - start_time
        ETP_CONSOLIDATION_DURATION_SECONDS.observe(duration)
        db.close()
