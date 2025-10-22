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

data "aws_subnets" "public" {
  filter {
    name   = "tag:Tier"
    values = ["Public"]
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "tag:Tier"
    values = ["Private"]
  }
}

data "aws_internet_gateway" "main" {
  filter {
    name   = "tag:Name"
    values = ["nexora-igw"]
  }
}

data "aws_nat_gateway" "main" {
  filter {
    name   = "tag:Name"
    values = ["nexora-nat-gw"]
  }
}

resource "aws_route_table" "public" {
  vpc_id = data.aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = data.aws_internet_gateway.main.id
  }

  tags = {
    Name = "nexora-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  for_each       = toset(data.aws_subnets.public.ids)
  subnet_id      = each.key
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = data.aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = data.aws_nat_gateway.main.id
  }

  tags = {
    Name = "nexora-private-rt"
  }
}

resource "aws_route_table_association" "private" {
  for_each       = toset(data.aws_subnets.private.ids)
  subnet_id      = each.key
  route_table_id = aws_route_table.private.id
}
