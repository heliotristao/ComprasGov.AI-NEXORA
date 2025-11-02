from app.db.models.template import Template
from sqlalchemy.orm import Session

def create_random_template(db: Session, name: str, path: str) -> Template:
    template = Template(name=name, path=path)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template
