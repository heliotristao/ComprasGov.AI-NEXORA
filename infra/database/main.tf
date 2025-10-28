terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Data source to get the VPC ID
data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["nexora-comprasgov-vpc"]
  }
}

# Data source to get the private subnets
data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }

  filter {
    name   = "tag:Tier"
    values = ["Private"]
  }
}

# Security Group for the RDS instance
resource "aws_security_group" "rds_sg" {
  name        = "nexora-rds-sg"
  description = "Allow PostgreSQL traffic from within the VPC"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nexora-rds-sg"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "default" {
  name       = "nexora-db-subnet-group"
  subnet_ids = data.aws_subnets.private.ids

  tags = {
    Name = "NEXORA DB Subnet Group"
  }
}

# RDS Instance
resource "aws_db_instance" "default" {
  allocated_storage      = 20
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  db_name                = "nexora_db"
  username               = "nexora_admin"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot    = true
  publicly_accessible    = false

  tags = {
    Name = "nexora-db-instance"
  }
}

# CRITICAL: The password should be managed by a secrets manager.
# This will be replaced by AWS Secrets Manager in a future task.
variable "db_password" {
  description = "The password for the RDS database"
  type        = string
  sensitive   = true
}

output "rds_endpoint" {
  description = "The endpoint of the RDS instance"
  value       = aws_db_instance.default.endpoint
}
