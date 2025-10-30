import logging
import os
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT_URL,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
)


def generate_s3_key(org_id, process_id, doc_type, version, filename):
    """Generates a unique S3 key for the artifact."""
    return f"{org_id}/{process_id}/{doc_type}/v{version}/{filename}"


def upload_file_to_s3(file_obj, s3_key: str):
    """Uploads a file-like object to S3."""
    try:
        s3_client.upload_fileobj(file_obj, S3_BUCKET_NAME, s3_key)
        logger.info(f"File uploaded to S3 with key: {s3_key}")
        return True
    except ClientError as e:
        logger.error(f"Failed to upload file to S3: {e}")
        return False


def get_presigned_download_url(s3_key: str, expiration: int = 3600):
    """Generates a pre-signed URL to download a file from S3."""
    try:
        response = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": s3_key},
            ExpiresIn=expiration,
        )
        return response
    except ClientError as e:
        logger.error(f"Failed to generate pre-signed URL: {e}")
        return None
