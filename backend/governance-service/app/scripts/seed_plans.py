"""
Script para popular o banco de dados com planos de exemplo
"""
import sys
import os
from decimal import Decimal

# Adicionar o diretório raiz ao path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.plan import Plan, PlanStatus
from app.db.models.user import User  # Import necessário para SQLAlchemy reconhecer a FK


def seed_plans():
    """Criar planos de exemplo no banco de dados"""
    db: Session = SessionLocal()

    try:
        # Verificar se já existem planos
        existing_count = db.query(Plan).count()
        if existing_count > 0:
            print(f"✓ Banco já possui {existing_count} planos. Pulando seed.")
            return

        # Buscar o usuário master (ID 1)
        master_user_id = 1

        # Criar planos de exemplo
        plans_data = [
            {
                "identifier": "PLANO-2025-001",
                "object": "Aquisição de equipamentos de informática para modernização do parque tecnológico",
                "justification": "Necessidade de substituição de equipamentos obsoletos que comprometem a produtividade dos servidores.",
                "status": "draft",
                "estimated_value": Decimal("150000.00"),
                "responsible_department": "Departamento de TI",
                "ai_generated": False,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-002",
                "object": "Contratação de empresa especializada em manutenção predial",
                "justification": "Manutenção preventiva e corretiva das instalações físicas do órgão.",
                "status": "pending",
                "estimated_value": Decimal("250000.00"),
                "responsible_department": "Departamento de Infraestrutura",
                "ai_generated": False,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-003",
                "object": "Aquisição de material de expediente para o exercício de 2025",
                "justification": "Suprimento de material de consumo necessário para as atividades administrativas.",
                "status": "approved",
                "estimated_value": Decimal("80000.00"),
                "responsible_department": "Departamento Administrativo",
                "ai_generated": True,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-004",
                "object": "Contratação de serviços de limpeza e conservação",
                "justification": "Manutenção da limpeza e conservação das instalações do órgão.",
                "status": "approved",
                "estimated_value": Decimal("180000.00"),
                "responsible_department": "Departamento Administrativo",
                "ai_generated": False,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-005",
                "object": "Aquisição de veículos para renovação da frota",
                "justification": "Substituição de veículos com mais de 10 anos de uso e alto custo de manutenção.",
                "status": "pending",
                "estimated_value": Decimal("320000.00"),
                "responsible_department": "Departamento de Transportes",
                "ai_generated": False,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-006",
                "object": "Contratação de empresa para desenvolvimento de sistema de gestão",
                "justification": "Modernização dos processos internos através de sistema informatizado.",
                "status": "draft",
                "estimated_value": Decimal("450000.00"),
                "responsible_department": "Departamento de TI",
                "ai_generated": True,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-007",
                "object": "Aquisição de mobiliário para novos postos de trabalho",
                "justification": "Adequação de espaços físicos para acomodar novos servidores.",
                "status": "rejected",
                "estimated_value": Decimal("120000.00"),
                "responsible_department": "Departamento Administrativo",
                "ai_generated": False,
                "created_by": master_user_id,
            },
            {
                "identifier": "PLANO-2025-008",
                "object": "Contratação de serviços de segurança patrimonial",
                "justification": "Reforço da segurança das instalações e patrimônio do órgão.",
                "status": "approved",
                "estimated_value": Decimal("280000.00"),
                "responsible_department": "Departamento de Segurança",
                "ai_generated": False,
                "created_by": master_user_id,
            },
        ]

        # Inserir planos no banco
        for plan_data in plans_data:
            plan = Plan(**plan_data)
            db.add(plan)

        db.commit()

        print(f"✓ {len(plans_data)} planos de exemplo criados com sucesso!")
        print("\nPlanos criados:")
        for plan_data in plans_data:
            print(f"  - {plan_data['identifier']}: {plan_data['object'][:50]}...")

    except Exception as e:
        print(f"✗ Erro ao criar planos: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Populando banco de dados com planos de exemplo...")
    seed_plans()
    print("\n✓ Seed concluído!")
