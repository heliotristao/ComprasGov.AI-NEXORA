# Notification Service

This service is responsible for sending notifications via email and webhooks.

## Configuration

The following environment variables are required to configure the service:

- `DATABASE_URL`: The connection string for the PostgreSQL database.
- `AWS_REGION`: The AWS region for the SES service (e.g., `us-east-1`).
- `SES_SENDER_EMAIL`: The email address to use as the sender for SES emails.
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
