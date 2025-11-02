import os
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

class StorageClient:
    def __init__(self):
        self.bucket_name = os.environ["S3_BUCKET_NAME"]
        self.s3 = boto3.client(
            "s3",
            endpoint_url=os.environ["S3_ENDPOINT_URL"],
            aws_access_key_id=os.environ["S3_ACCESS_KEY"],
            aws_secret_access_key=os.environ["S3_SECRET_KEY"],
            config=Config(signature_version="s3v4"),
        )
        self._create_bucket_if_not_exists()

    def _create_bucket_if_not_exists(self):
        try:
            self.s3.head_bucket(Bucket=self.bucket_name)
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                self.s3.create_bucket(Bucket=self.bucket_name)
            else:
                raise

    def upload_file(self, file_obj, object_name: str) -> str:
        self.s3.upload_fileobj(file_obj, self.bucket_name, object_name)
        return object_name

    def download_file(self, object_name: str):
        return self.s3.get_object(Bucket=self.bucket_name, Key=object_name)

# Singleton instance
storage_client = StorageClient()
