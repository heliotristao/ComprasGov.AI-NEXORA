#!/usr/bin/env bash
set -euo pipefail

TARGET_APP_URL=${TARGET_APP_URL:-"http://host.docker.internal:3000"}
ZAP_PORT=${ZAP_PORT:-"8090"}
OUTPUT_DIR=${OUTPUT_DIR:-"docs/security_reports"}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
HTML_REPORT="${OUTPUT_DIR}/zap-report-${TIMESTAMP}.html"
JSON_REPORT="${OUTPUT_DIR}/zap-report-${TIMESTAMP}.json"

mkdir -p "${OUTPUT_DIR}"

echo "[+] Executando OWASP ZAP full scan contra ${TARGET_APP_URL}"
docker run --rm -v "$(pwd)":/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-full-scan.py \
  -t "${TARGET_APP_URL}" -p "${ZAP_PORT}" -g gen.conf \
  -r "${HTML_REPORT}" -J "${JSON_REPORT}"

echo "[+] Relatórios salvos em:"
echo " - ${HTML_REPORT}"
echo " - ${JSON_REPORT}"
