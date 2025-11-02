"""
Script consolidado para popular todo o banco de dados
Cria usuário master, planos, ETPs, TRs e dados de exemplo
"""
import sys
import os

# Adicionar os diretórios dos serviços ao path
governance_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../governance-service"))
planning_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../planning-service"))

sys.path.insert(0, governance_path)
sys.path.insert(0, planning_path)

print("=" * 60)
print("SEED COMPLETO - ComprasGov.AI NEXORA")
print("=" * 60)

# ============================================================================
# 1. GOVERNANCE SERVICE - Criar usuário master
# ============================================================================
print("\n[1/3] Criando usuário master no Governance Service...")

try:
    from sqlalchemy.orm import Session
    from app.db.session import SessionLocal as GovernanceSession
    from app.db.models.user import User
    from app.core.security import get_password_hash

    db: Session = GovernanceSession()

    try:
        # Verificar se o usuário master já existe
        existing_user = db.query(User).filter(User.email == "master@comprasgov.ai").first()

        if existing_user:
            print("✓ Usuário master já existe.")
        else:
            # Criar usuário master
            master_user = User(
                email="master@comprasgov.ai",
                hashed_password=get_password_hash("masterpassword"),
                full_name="Administrador Master",
                is_active=True,
                is_superuser=True,
            )
            db.add(master_user)
            db.commit()
            db.refresh(master_user)
            print(f"✓ Usuário master criado! ID: {master_user.id}")
            print(f"  Email: master@comprasgov.ai")
            print(f"  Senha: masterpassword")

    except Exception as e:
        print(f"✗ Erro ao criar usuário master: {e}")
        db.rollback()
    finally:
        db.close()

except Exception as e:
    print(f"✗ Erro ao conectar no Governance Service: {e}")
    print("  Verifique se DATABASE_URL está configurado corretamente.")

# ============================================================================
# 2. GOVERNANCE SERVICE - Criar planos
# ============================================================================
print("\n[2/3] Criando planos de contratação...")

try:
    from decimal import Decimal
    from app.models.plan import Plan

    db: Session = GovernanceSession()

    try:
        # Verificar se já existem planos
        existing_count = db.query(Plan).count()

        if existing_count > 0:
            print(f"✓ Banco já possui {existing_count} planos.")
        else:
            # Buscar o usuário master
            master_user = db.query(User).filter(User.email == "master@comprasgov.ai").first()

            if not master_user:
                print("✗ Usuário master não encontrado. Execute o seed do usuário primeiro.")
            else:
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
                        "created_by": master_user.id,
                    },
                    {
                        "identifier": "PLANO-2025-002",
                        "object": "Contratação de empresa especializada em manutenção predial",
                        "justification": "Manutenção preventiva e corretiva das instalações físicas do órgão.",
                        "status": "pending",
                        "estimated_value": Decimal("250000.00"),
                        "responsible_department": "Departamento de Infraestrutura",
                        "ai_generated": False,
                        "created_by": master_user.id,
                    },
                    {
                        "identifier": "PLANO-2025-003",
                        "object": "Aquisição de material de expediente para o exercício de 2025",
                        "justification": "Suprimento de material de consumo necessário para as atividades administrativas.",
                        "status": "approved",
                        "estimated_value": Decimal("80000.00"),
                        "responsible_department": "Departamento Administrativo",
                        "ai_generated": True,
                        "created_by": master_user.id,
                    },
                    {
                        "identifier": "PLANO-2025-004",
                        "object": "Contratação de serviços de limpeza e conservação",
                        "justification": "Manutenção da limpeza e conservação das instalações do órgão.",
                        "status": "approved",
                        "estimated_value": Decimal("180000.00"),
                        "responsible_department": "Departamento Administrativo",
                        "ai_generated": False,
                        "created_by": master_user.id,
                    },
                    {
                        "identifier": "PLANO-2025-005",
                        "object": "Aquisição de veículos para renovação da frota",
                        "justification": "Substituição de veículos com mais de 10 anos de uso e alto custo de manutenção.",
                        "status": "pending",
                        "estimated_value": Decimal("320000.00"),
                        "responsible_department": "Departamento de Transportes",
                        "ai_generated": False,
                        "created_by": master_user.id,
                    },
                ]

                # Inserir planos no banco
                for plan_data in plans_data:
                    plan = Plan(**plan_data)
                    db.add(plan)

                db.commit()
                print(f"✓ {len(plans_data)} planos criados com sucesso!")

    except Exception as e:
        print(f"✗ Erro ao criar planos: {e}")
        db.rollback()
    finally:
        db.close()

except Exception as e:
    print(f"✗ Erro ao processar planos: {e}")

# ============================================================================
# 3. PLANNING SERVICE - Criar templates, ETPs e TRs
# ============================================================================
print("\n[3/3] Criando templates, ETPs e TRs...")
print("⚠️  Esta etapa requer que o Planning Service esteja configurado.")
print("    Execute manualmente: python backend/planning-service/scripts/seed_etp_system.py")

# ============================================================================
# RESUMO FINAL
# ============================================================================
print("\n" + "=" * 60)
print("RESUMO DO SEED")
print("=" * 60)
print("\n✓ Usuário Master:")
print("  Email: master@comprasgov.ai")
print("  Senha: masterpassword")
print("\n✓ Dados criados:")
print("  - Usuário master")
print("  - 5 planos de contratação")
print("  - (Execute seed_etp_system.py para ETPs e TRs)")
print("\n✓ Próximos passos:")
print("  1. Acesse: https://compras-gov-ai-nexora.vercel.app/login")
print("  2. Faça login com as credenciais master")
print("  3. Explore o dashboard e funcionalidades")
print("\n" + "=" * 60)
