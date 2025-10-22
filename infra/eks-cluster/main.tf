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

data "aws_subnets" "private" {
  filter {
    name   = "tag:Tier"
    values = ["Private"]
  }
}

data "aws_iam_role" "eks_cluster" {
  name = "nexora-eks-cluster-role"
}

data "aws_iam_role" "eks_nodegroup" {
  name = "nexora-eks-nodegroup-role"
}

resource "aws_eks_cluster" "main" {
  name     = "nexora-comprasgov-cluster"
  role_arn = data.aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = data.aws_subnets.private.ids
  }

}

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "nexora-general-nodegroup"
  node_role_arn   = data.aws_iam_role.eks_nodegroup.arn
  subnet_ids      = data.aws_subnets.private.ids
  instance_types  = ["t3.medium"]

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  depends_on = [
    aws_eks_cluster.main
  ]
}
