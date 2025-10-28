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

data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["nexora-comprasgov-vpc"]
  }
}

data "aws_subnet" "public_a" {
  filter {
    name   = "tag:Name"
    values = ["nexora-public-subnet-a"]
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    Name = "nexora-igw"
  }
}

resource "aws_eip" "nat" {
  depends_on = [aws_internet_gateway.main]
  tags = {
    Name = "nexora-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = data.aws_subnet.public_a.id
  tags = {
    Name = "nexora-nat-gw"
  }
}
