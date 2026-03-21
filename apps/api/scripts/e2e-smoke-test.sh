#!/bin/bash
set -e

BASE="http://localhost:8080/api/v1"
SLUG="e2e-test-$(date +%s)"
EMAIL="owner@${SLUG}.com"
PASS="TestPass123!"
TENANT_HEADER="x-tenant-slug: ${SLUG}"
PASS_COUNT=0
FAIL_COUNT=0
TOTAL=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; }

check() {
  TOTAL=$((TOTAL + 1))
  local name="$1"
  local status="$2"
  local body="$3"
  if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
    green "$name (HTTP $status)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    red "$name (HTTP $status)"
    echo "  Response: $(echo "$body" | head -c 200)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

request() {
  local method="$1"
  local path="$2"
  local data="$3"
  local extra_headers="$4"

  local args=(-s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "$TENANT_HEADER")

  if [ -n "$TOKEN" ]; then
    args+=(-H "Authorization: Bearer $TOKEN")
  fi

  if [ -n "$COOKIE_JAR" ] && [ -f "$COOKIE_JAR" ]; then
    args+=(-b "$COOKIE_JAR")
  fi

  if [ -n "$extra_headers" ]; then
    args+=(-H "$extra_headers")
  fi

  if [ -n "$data" ]; then
    args+=(-d "$data")
  fi

  local response
  response=$(curl "${args[@]}" "${BASE}${path}")
  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  echo "$body" > /tmp/e2e_last_response.json
  LAST_STATUS="$http_code"
  LAST_BODY="$body"
}

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  NexoCRM E2E Smoke Test"
echo "  Base: $BASE"
echo "  Tenant: $SLUG"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "── AUTH ──────────────────────────────────────────────────────"

COOKIE_JAR="/tmp/e2e_cookies_$$.txt"
ONBOARD_RESP=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -c "$COOKIE_JAR" \
  "${BASE}/auth/onboard" \
  -d "{
    \"businessName\": \"E2E Test Corp\",
    \"slug\": \"$SLUG\",
    \"ownerEmail\": \"$EMAIL\",
    \"ownerPassword\": \"$PASS\",
    \"ownerFullName\": \"E2E Owner\"
  }")
LAST_STATUS=$(echo "$ONBOARD_RESP" | tail -1)
LAST_BODY=$(echo "$ONBOARD_RESP" | sed '$d')
check "POST /auth/onboard (register tenant)" "$LAST_STATUS" "$LAST_BODY"
TOKEN=$(grep "access_token" "$COOKIE_JAR" 2>/dev/null | awk '{print $NF}' || echo "")

if [ -z "$TOKEN" ]; then
  red "No token received — cannot continue"
  exit 1
fi
green "Got access token: ${TOKEN:0:20}..."

LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "$TENANT_HEADER" \
  -c "$COOKIE_JAR" \
  "${BASE}/auth/login" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASS\"}")
LAST_STATUS=$(echo "$LOGIN_RESP" | tail -1)
LAST_BODY=$(echo "$LOGIN_RESP" | sed '$d')
check "POST /auth/login" "$LAST_STATUS" "$LAST_BODY"
TOKEN=$(grep "access_token" "$COOKIE_JAR" 2>/dev/null | awk '{print $NF}' || echo "$TOKEN")

request GET "/auth/me"
check "GET /auth/me" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── CONTACTS ─────────────────────────────────────────────────"

request POST "/contacts" "{\"firstName\": \"Juan\", \"lastName\": \"Pérez\", \"email\": \"juan@test.co\", \"phone\": \"3001234567\"}"
check "POST /contacts (create)" "$LAST_STATUS" "$LAST_BODY"
CONTACT_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")

request GET "/contacts"
check "GET /contacts (list)" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$CONTACT_ID" ]; then
  request GET "/contacts/$CONTACT_ID"
  check "GET /contacts/:id" "$LAST_STATUS" "$LAST_BODY"

  request PATCH "/contacts/$CONTACT_ID" "{\"lastName\": \"Pérez García\"}"
  check "PATCH /contacts/:id (update)" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── COMPANIES ────────────────────────────────────────────────"

request POST "/companies" "{\"name\": \"Acme Test SAS\", \"nit\": \"900123456\", \"taxRegime\": \"responsible_vat\"}"
check "POST /companies (create)" "$LAST_STATUS" "$LAST_BODY"
COMPANY_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")

request GET "/companies"
check "GET /companies (list)" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$COMPANY_ID" ]; then
  request GET "/companies/$COMPANY_ID"
  check "GET /companies/:id" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── SETTINGS / PIPELINES ─────────────────────────────────────"

request GET "/settings/pipelines"
check "GET /settings/pipelines (list)" "$LAST_STATUS" "$LAST_BODY"
PIPELINE_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); data=d.get('data',d) if isinstance(d,dict) else d; print(data[0]['id'] if data else '')" 2>/dev/null || echo "")

if [ -n "$PIPELINE_ID" ]; then
  request GET "/settings/pipelines/$PIPELINE_ID"
  check "GET /settings/pipelines/:id" "$LAST_STATUS" "$LAST_BODY"
  STAGE_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); data=d.get('data',d) if isinstance(d,dict) else d; print(data.get('stages',[])[0]['id'] if data.get('stages') else '')" 2>/dev/null || echo "")

  request GET "/settings/pipelines/$PIPELINE_ID/kanban"
  check "GET /settings/pipelines/:id/kanban" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── DEALS ────────────────────────────────────────────────────"

DEAL_DATA="{\"title\": \"Big Deal E2E\", \"valueCents\": 5000000"
if [ -n "$PIPELINE_ID" ] && [ -n "$STAGE_ID" ]; then
  DEAL_DATA="$DEAL_DATA, \"pipelineId\": \"$PIPELINE_ID\", \"stageId\": \"$STAGE_ID\""
fi
DEAL_DATA="$DEAL_DATA}"

request POST "/deals" "$DEAL_DATA"
check "POST /deals (create)" "$LAST_STATUS" "$LAST_BODY"
DEAL_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")

request GET "/deals"
check "GET /deals (list)" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$DEAL_ID" ]; then
  request GET "/deals/$DEAL_ID"
  check "GET /deals/:id" "$LAST_STATUS" "$LAST_BODY"

  request GET "/deals/forecast"
  check "GET /deals/forecast" "$LAST_STATUS" "$LAST_BODY"

  request PATCH "/deals/$DEAL_ID/won"
  check "PATCH /deals/:id/won" "$LAST_STATUS" "$LAST_BODY"

  request PATCH "/deals/$DEAL_ID/reopen"
  check "PATCH /deals/:id/reopen" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── ACTIVITIES ───────────────────────────────────────────────"

request POST "/activities" "{\"activityType\": \"call\", \"title\": \"Follow up call\", \"dueDate\": \"2026-04-01T10:00:00Z\"}"
check "POST /activities (create)" "$LAST_STATUS" "$LAST_BODY"
ACTIVITY_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")

request GET "/activities"
check "GET /activities (list)" "$LAST_STATUS" "$LAST_BODY"

request GET "/activities/calendar?from=2026-03-01&to=2026-05-01"
check "GET /activities/calendar" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$ACTIVITY_ID" ]; then
  request PATCH "/activities/$ACTIVITY_ID/complete"
  check "PATCH /activities/:id/complete" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── PRODUCTS ──────────────────────────────────────────────────"

request POST "/products" "{\"name\": \"Widget Pro\", \"sku\": \"WDG-001\", \"priceCents\": 15000, \"category\": \"Electronics\"}"
check "POST /products (create)" "$LAST_STATUS" "$LAST_BODY"
PRODUCT_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")

request GET "/products"
check "GET /products (list)" "$LAST_STATUS" "$LAST_BODY"

request GET "/products/low-stock"
check "GET /products/low-stock" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$PRODUCT_ID" ]; then
  request POST "/products/$PRODUCT_ID/inventory" "{\"quantity\": 50, \"movementType\": \"purchase\", \"notes\": \"Initial stock\"}"
  check "POST /products/:id/inventory (purchase)" "$LAST_STATUS" "$LAST_BODY"

  request POST "/products/$PRODUCT_ID/duplicate"
  check "POST /products/:id/duplicate" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── NOTIFICATIONS ────────────────────────────────────────────"

request GET "/notifications"
check "GET /notifications (list)" "$LAST_STATUS" "$LAST_BODY"

request PATCH "/notifications/mark-all-read"
check "PATCH /notifications/mark-all-read" "$LAST_STATUS" "$LAST_BODY"

request GET "/notifications/preferences"
check "GET /notifications/preferences" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── DASHBOARD ────────────────────────────────────────────────"

request GET "/dashboard"
check "GET /dashboard (full)" "$LAST_STATUS" "$LAST_BODY"

request GET "/dashboard/metrics"
check "GET /dashboard/metrics" "$LAST_STATUS" "$LAST_BODY"

request GET "/dashboard/pipeline-summary"
check "GET /dashboard/pipeline-summary" "$LAST_STATUS" "$LAST_BODY"

request GET "/dashboard/today-activities"
check "GET /dashboard/today-activities" "$LAST_STATUS" "$LAST_BODY"

request GET "/dashboard/top-sales-reps"
check "GET /dashboard/top-sales-reps" "$LAST_STATUS" "$LAST_BODY"

request GET "/dashboard/revenue-by-month"
check "GET /dashboard/revenue-by-month" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── TAGS ───────────────────────────────────────────────────────"

request POST "/tags" "{\"name\": \"VIP\", \"color\": \"#EF4444\", \"entityType\": \"contact\"}"
check "POST /tags (create)" "$LAST_STATUS" "$LAST_BODY"

request GET "/tags"
check "GET /tags (list)" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── MESSAGE TEMPLATES ─────────────────────────────────────────"

request POST "/message-templates" "{\"name\": \"Welcome Email\", \"channel\": \"email\", \"subject\": \"Welcome {{nombre}}\", \"body\": \"<h1>Hello {{nombre}}</h1><p>Welcome to our CRM!</p>\"}"
check "POST /message-templates (create)" "$LAST_STATUS" "$LAST_BODY"
TEMPLATE_ID=$(echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',d).get('id',''))" 2>/dev/null || echo "")

request GET "/message-templates"
check "GET /message-templates (list)" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$TEMPLATE_ID" ]; then
  request POST "/message-templates/$TEMPLATE_ID/preview" "{\"nombre\": \"Juan Pérez\"}"
  check "POST /message-templates/:id/preview" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── SAVED FILTERS ─────────────────────────────────────────────"

request POST "/saved-filters" "{\"entityType\": \"contact\", \"name\": \"My VIP Contacts\", \"filters\": {\"tags\": [\"VIP\"], \"status\": \"client\"}}"
check "POST /saved-filters (create)" "$LAST_STATUS" "$LAST_BODY"

request GET "/saved-filters?entityType=contact"
check "GET /saved-filters (list)" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── TIMELINE ──────────────────────────────────────────────────"

if [ -n "$CONTACT_ID" ]; then
  request GET "/contacts/$CONTACT_ID/timeline"
  check "GET /contacts/:id/timeline" "$LAST_STATUS" "$LAST_BODY"
fi

if [ -n "$DEAL_ID" ]; then
  request GET "/deals/$DEAL_ID/timeline"
  check "GET /deals/:id/timeline" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "── WEBHOOKS ───────────────────────────────────────────────────"

request POST "/webhooks" "{\"url\": \"https://webhook.site/test\", \"events\": [\"contact.created\", \"deal.won\"]}"
check "POST /webhooks (create)" "$LAST_STATUS" "$LAST_BODY"

request GET "/webhooks"
check "GET /webhooks (list)" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── API KEYS ──────────────────────────────────────────────────"

request POST "/api-keys" "{\"name\": \"Test API Key\", \"scopes\": [\"*\"]}"
check "POST /api-keys (create)" "$LAST_STATUS" "$LAST_BODY"

request GET "/api-keys"
check "GET /api-keys (list)" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── AUDIT LOG ─────────────────────────────────────────────────"

request GET "/audit-log"
check "GET /audit-log (list)" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "── SETTINGS ──────────────────────────────────────────────────"

request GET "/settings/general"
check "GET /settings/general" "$LAST_STATUS" "$LAST_BODY"

request GET "/settings/activity-types"
check "GET /settings/activity-types" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  RESULTS: $PASS_COUNT passed / $FAIL_COUNT failed / $TOTAL total"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
