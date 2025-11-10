#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt
python -m spacy download pt_core_news_lg

if [ -f alembic.ini ]; then
  alembic upgrade head
fi
