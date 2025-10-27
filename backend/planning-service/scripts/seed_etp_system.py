"""
Script para popular banco de dados com dados iniciais do sistema ETP/TR
"""

import sys
import os
import json
from pathlib import Path

# Adicionar diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.base import SessionLocal, engine
from app.db.models.templates_gestao import (
    CampoObrigatorioLei,
    Instituicao,
    ModeloSuperior,
    ModeloInstitucional
)


def load_json_file(filename: str) -> dict:
    """Carrega arquivo JSON"""
    filepath = Path(__file__).parent.parent / "seeds" / filename
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_campos_obrigatorios(db: Session):
    """Popula campos obrigatórios da lei"""
    print("Populando campos obrigatórios da lei...")
    
    # Carregar dados
    campos_etp = load_json_file("campos_obrigatorios_etp.json")
    
    for campo_data in campos_etp:
        # Verificar se já existe
        exists = db.query(CampoObrigatorioLei).filter(
            CampoObrigatorioLei.codigo == campo_data["codigo"]
        ).first()
        
        if not exists:
            campo = CampoObrigatorioLei(**campo_data)
            db.add(campo)
            print(f"  ✓ Criado: {campo_data['codigo']} - {campo_data['nome']}")
    
    db.commit()
    print(f"✓ {len(campos_etp)} campos obrigatórios criados\n")


def seed_modelos_superiores(db: Session):
    """Popula modelos superiores (TCU, TCE, PGE)"""
    print("Populando modelos superiores...")
    
    # Carregar dados
    modelo_tcu = load_json_file("modelo_superior_tcu_etp.json")
    
    # Verificar se já existe
    exists = db.query(ModeloSuperior).filter(
        ModeloSuperior.codigo == modelo_tcu["codigo"]
    ).first()
    
    if not exists:
        modelo = ModeloSuperior(**modelo_tcu)
        db.add(modelo)
        db.commit()
        print(f"  ✓ Criado: {modelo_tcu['nome']}")
    else:
        print(f"  → Já existe: {modelo_tcu['nome']}")
    
    print("✓ Modelos superiores criados\n")


def seed_instituicao_demo(db: Session):
    """Cria instituição de demonstração"""
    print("Criando instituição de demonstração...")
    
    # Verificar se já existe
    exists = db.query(Instituicao).filter(
        Instituicao.cnpj == "00.000.000/0001-00"
    ).first()
    
    if not exists:
        instituicao = Instituicao(
            nome="Prefeitura Municipal de Exemplo",
            sigla="PME",
            cnpj="00.000.000/0001-00",
            tipo="prefeitura",
            uf="ES",
            municipio="Exemplo",
            ativo=True,
            orgao_controle="TCE-ES",
            plano="profissional"
        )
        db.add(instituicao)
        db.commit()
        print(f"  ✓ Criada: {instituicao.nome}")
        return instituicao.id
    else:
        print(f"  → Já existe: {exists.nome}")
        return exists.id


def seed_modelo_institucional_demo(db: Session, instituicao_id: int, modelo_superior_id: int):
    """Cria modelo institucional de demonstração"""
    print("Criando modelo institucional de demonstração...")
    
    # Buscar modelo superior
    modelo_superior = db.query(ModeloSuperior).filter(
        ModeloSuperior.id == modelo_superior_id
    ).first()
    
    if not modelo_superior:
        print("  ✗ Modelo superior não encontrado")
        return
    
    # Verificar se já existe
    exists = db.query(ModeloInstitucional).filter(
        ModeloInstitucional.instituicao_id == instituicao_id,
        ModeloInstitucional.nome == "ETP Padrão - Prefeitura de Exemplo"
    ).first()
    
    if not exists:
        # Copiar estrutura do modelo superior
        modelo = ModeloInstitucional(
            instituicao_id=instituicao_id,
            modelo_superior_id=modelo_superior_id,
            nome="ETP Padrão - Prefeitura de Exemplo",
            descricao="Modelo padrão customizado baseado no TCU",
            tipo_documento="ETP",
            tipo_contratacao="Geral",
            versao="1.0",
            status="ativo",
            estrutura=modelo_superior.estrutura,
            mapeamento_lei=modelo_superior.mapeamento_lei,
            configuracao_documento={
                "margem_superior": 1,
                "margem_inferior": 1,
                "margem_esquerda": 1.5,
                "margem_direita": 1,
                "texto_cabecalho": "PREFEITURA MUNICIPAL DE EXEMPLO\nSecretaria de Administração",
                "texto_rodape": "Documento gerado pelo sistema ComprasGov.AI - NEXORA"
            },
            prompts_ia={},
            created_by=1
        )
        db.add(modelo)
        db.commit()
        print(f"  ✓ Criado: {modelo.nome}")
    else:
        print(f"  → Já existe: {exists.nome}")


def main():
    """Função principal"""
    print("\n" + "="*60)
    print("SEED DO SISTEMA ETP/TR")
    print("="*60 + "\n")
    
    db = SessionLocal()
    
    try:
        # 1. Campos obrigatórios da lei
        seed_campos_obrigatorios(db)
        
        # 2. Modelos superiores
        seed_modelos_superiores(db)
        
        # 3. Instituição demo
        instituicao_id = seed_instituicao_demo(db)
        
        # 4. Modelo institucional demo
        modelo_superior = db.query(ModeloSuperior).filter(
            ModeloSuperior.codigo == "TCU-ETP-V2"
        ).first()
        
        if modelo_superior:
            seed_modelo_institucional_demo(db, instituicao_id, modelo_superior.id)
        
        print("="*60)
        print("✓ SEED CONCLUÍDO COM SUCESSO!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n✗ ERRO: {e}\n")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

