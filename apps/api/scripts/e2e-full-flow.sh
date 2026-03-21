#!/bin/bash
set -e

BASE="http://localhost:8080/api/v1"
SLUG="distribuidora-nexo"
EMAIL="carlos@distribuidoranexo.com"
PASS="Carlos2026!"
TENANT_HEADER="x-tenant-slug: ${SLUG}"
COOKIE_JAR="/tmp/e2e_cookies_$$.txt"
PASS_COUNT=0
FAIL_COUNT=0
TOTAL=0

green() { printf "\033[32m✓ %s\033[0m\n" "$1"; }
red()   { printf "\033[31m✗ %s\033[0m\n" "$1"; }
blue()  { printf "\033[34m  → %s\033[0m\n" "$1"; }

check() {
  TOTAL=$((TOTAL + 1))
  local name="$1" status="$2" body="$3"
  if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
    green "$name (HTTP $status)"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    red "$name (HTTP $status)"
    echo "  Response: $(echo "$body" | head -c 300)"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

req() {
  local method="$1" path="$2" data="$3"
  local args=(-s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -H "$TENANT_HEADER" -b "$COOKIE_JAR" -c "$COOKIE_JAR")
  if [ -n "$TOKEN" ]; then args+=(-H "Authorization: Bearer $TOKEN"); fi
  if [ -n "$data" ]; then args+=(-d "$data"); fi
  local response
  response=$(curl "${args[@]}" "${BASE}${path}")
  LAST_STATUS=$(echo "$response" | tail -1)
  LAST_BODY=$(echo "$response" | sed '$d')
}

jq_extract() { echo "$LAST_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); $1" 2>/dev/null; }

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  NexoCRM — Full Flow E2E Test (Real Data)"
echo "  Distribuidora Nexo SAS — Carlos García, Owner"
echo "═══════════════════════════════════════════════════════════════"

echo ""
echo "━━━ 1. ONBOARDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ONBOARD_RESP=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" -c "$COOKIE_JAR" \
  "${BASE}/auth/onboard" \
  -d '{
    "businessName": "Distribuidora Nexo SAS",
    "slug": "'$SLUG'",
    "ownerEmail": "'$EMAIL'",
    "ownerPassword": "'$PASS'",
    "ownerFullName": "Carlos García"
  }')
LAST_STATUS=$(echo "$ONBOARD_RESP" | tail -1)
LAST_BODY=$(echo "$ONBOARD_RESP" | sed '$d')
check "Onboard: Distribuidora Nexo SAS" "$LAST_STATUS" "$LAST_BODY"
TOKEN=$(grep "access_token" "$COOKIE_JAR" 2>/dev/null | awk '{print $NF}')

TENANT_ID=$(jq_extract "print(d.get('data',d).get('tenant',{}).get('id',''))")
blue "Tenant ID: $TENANT_ID"
blue "Schema: tenant_${SLUG//-/_}"

req POST "/auth/login" '{"email":"'$EMAIL'","password":"'$PASS'"}'
TOKEN=$(grep "access_token" "$COOKIE_JAR" 2>/dev/null | awk '{print $NF}')
check "Login as Carlos García" "$LAST_STATUS" "$LAST_BODY"

req GET "/auth/me"
check "Get current user profile" "$LAST_STATUS" "$LAST_BODY"
blue "Role: $(jq_extract "print(d.get('data',d).get('role',''))")"

echo ""
echo "━━━ 2. SETTINGS & BRANDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req GET "/settings/general"
check "Get current settings" "$LAST_STATUS" "$LAST_BODY"

req PATCH "/settings/theme" '{
  "colors": {
    "primary": "#1E40AF",
    "primaryForeground": "#FFFFFF",
    "secondary": "#F59E0B",
    "accent": "#10B981",
    "sidebar": "#1E293B",
    "sidebarForeground": "#F8FAFC"
  },
  "branding": {
    "companyName": "Distribuidora Nexo",
    "loginTagline": "Tu distribucion inteligente",
    "logoUrl": "https://cdn.nexocrm.co/logos/distribuidora-nexo.png"
  },
  "darkModeDefault": "light"
}'
check "Set theme: blue primary + gold secondary" "$LAST_STATUS" "$LAST_BODY"

req PATCH "/settings/nomenclature" '{
  "contact": "Cliente",
  "company": "Empresa",
  "deal": "Negocio",
  "activity": "Tarea"
}'
check "Set nomenclature: Cliente, Empresa, Negocio, Tarea" "$LAST_STATUS" "$LAST_BODY"

req GET "/settings/activity-types"
check "Get activity types" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "━━━ 3. PIPELINE SETUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req GET "/settings/pipelines"
check "Get pipelines" "$LAST_STATUS" "$LAST_BODY"
PIPELINE_ID=$(jq_extract "data=d.get('data',d); print(data[0]['id'] if isinstance(data,list) and data else '')")

if [ -n "$PIPELINE_ID" ]; then
  req PATCH "/settings/pipelines/$PIPELINE_ID/stages" '{
    "stages": [
      {"name": "Prospecto", "color": "#6366F1", "probability": 10, "position": 0},
      {"name": "Contactado", "color": "#3B82F6", "probability": 25, "position": 1},
      {"name": "Propuesta enviada", "color": "#F59E0B", "probability": 50, "position": 2},
      {"name": "Negociación", "color": "#EF4444", "probability": 75, "position": 3},
      {"name": "Cierre", "color": "#10B981", "probability": 90, "position": 4}
    ]
  }'
  check "Configure 5 pipeline stages" "$LAST_STATUS" "$LAST_BODY"

  req GET "/settings/pipelines/$PIPELINE_ID"
  STAGE_IDS=$(jq_extract "
data=d.get('data',d)
stages=data.get('stages',[]) if isinstance(data,dict) else []
for s in stages: print(s['id'], s['name'])
")
  blue "Stages: $(echo "$STAGE_IDS" | head -5)"
  STAGE_1=$(echo "$STAGE_IDS" | head -1 | awk '{print $1}')
  STAGE_3=$(echo "$STAGE_IDS" | sed -n '3p' | awk '{print $1}')
fi

echo ""
echo "━━━ 4. TAGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/tags" '{"name":"VIP","color":"#EF4444","entityType":"contact"}'
check "Tag: VIP (red) for contacts" "$LAST_STATUS" "$LAST_BODY"

req POST "/tags" '{"name":"Mayorista","color":"#3B82F6","entityType":"company"}'
check "Tag: Mayorista (blue) for companies" "$LAST_STATUS" "$LAST_BODY"

req POST "/tags" '{"name":"Urgente","color":"#F97316","entityType":"deal"}'
check "Tag: Urgente (orange) for deals" "$LAST_STATUS" "$LAST_BODY"

req POST "/tags" '{"name":"Promoción","color":"#8B5CF6","entityType":"product"}'
check "Tag: Promoción (purple) for products" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "━━━ 5. COMPANIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/companies" '{
  "name": "Almacenes El Triunfo SAS",
  "nit": "900775106",
  "taxRegime": "responsible_vat",
  "companySize": "medium",
  "sectorCiiu": "G",
  "website": "https://eltriunfo.com.co",
  "phone": "6012345678",
  "email": "compras@eltriunfo.com.co",
  "address": "Cra 7 #45-23 Local 102",
  "city": "Bogotá",
  "department": "Cundinamarca",
  "municipioCode": "11001",
  "tags": ["Mayorista"]
}'
check "Company: Almacenes El Triunfo SAS (NIT 900.775.106-2)" "$LAST_STATUS" "$LAST_BODY"
COMPANY_ID=$(jq_extract "print(d.get('data',d).get('id',''))")
blue "Company ID: $COMPANY_ID"
blue "NIT formatted: $(jq_extract "print(d.get('data',d).get('nitFormatted',''))")"

req POST "/companies" '{
  "name": "Ferretería La Nacional LTDA",
  "nit": "800197268",
  "taxRegime": "not_responsible",
  "companySize": "small",
  "sectorCiiu": "G",
  "phone": "3124567890",
  "email": "ventas@lanacional.co",
  "city": "Medellín",
  "department": "Antioquia",
  "municipioCode": "05001"
}'
check "Company: Ferretería La Nacional LTDA" "$LAST_STATUS" "$LAST_BODY"
COMPANY_2_ID=$(jq_extract "print(d.get('data',d).get('id',''))")

echo ""
echo "━━━ 6. CONTACTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/contacts" '{
  "firstName": "María",
  "lastName": "López Hernández",
  "email": "maria.lopez@eltriunfo.com.co",
  "phone": "3001234567",
  "whatsapp": "3001234567",
  "documentType": "cc",
  "documentNumber": "52345678",
    "city": "Bogotá",
  "department": "Cundinamarca",
  "source": "referral",
  "tags": ["VIP"],
  "companyId": "'$COMPANY_ID'"
}'
check "Contact: María López (Directora de Compras @ El Triunfo)" "$LAST_STATUS" "$LAST_BODY"
CONTACT_ID=$(jq_extract "print(d.get('data',d).get('id',''))")
blue "Contact ID: $CONTACT_ID"

req POST "/contacts" '{
  "firstName": "Andrés",
  "lastName": "Ramírez",
  "email": "andres@lanacional.co",
  "phone": "3209876543",
  "documentType": "cc",
  "documentNumber": "80123456",
    "city": "Medellín",
  "department": "Antioquia",
  "source": "cold_call",
  "companyId": "'$COMPANY_2_ID'"
}'
check "Contact: Andrés Ramírez (Gerente @ La Nacional)" "$LAST_STATUS" "$LAST_BODY"
CONTACT_2_ID=$(jq_extract "print(d.get('data',d).get('id',''))")

req POST "/contacts" '{
  "firstName": "Laura",
  "lastName": "Martínez",
  "email": "laura.martinez@gmail.com",
  "phone": "3112223344",
  "source": "web_form",
  "tags": ["VIP"]
}'
check "Contact: Laura Martínez (lead from web form)" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "━━━ 7. PRODUCTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/products" '{
  "name": "Cemento Portland Tipo I x 50kg",
  "sku": "CEM-001",
  "barcode": "7701234567890",
  "category": "Construcción",
  "brand": "Argos",
  "priceCents": 3500000,
  "costCents": 2800000,
  "ivaRate": 19,
  "productType": "product",
  "unitOfMeasure": "bulto",
  "minStock": 50,
  "tags": ["Promoción"]
}'
check "Product: Cemento Portland 50kg ($35,000 COP)" "$LAST_STATUS" "$LAST_BODY"
PRODUCT_1=$(jq_extract "print(d.get('data',d).get('id',''))")

req POST "/products" '{
  "name": "Varilla corrugada 1/2\" x 6m",
  "sku": "VAR-012",
  "category": "Construcción",
  "brand": "Diaco",
  "priceCents": 4200000,
  "costCents": 3500000,
  "productType": "product",
  "unitOfMeasure": "unidad",
  "minStock": 100
}'
check "Product: Varilla corrugada 1/2\" ($42,000 COP)" "$LAST_STATUS" "$LAST_BODY"
PRODUCT_2=$(jq_extract "print(d.get('data',d).get('id',''))")

req POST "/products" '{
  "name": "Asesoría técnica en obra",
  "sku": "SRV-001",
  "priceCents": 15000000,
  "productType": "service",
  "unitOfMeasure": "hora",
  "category": "Servicios"
}'
check "Product: Asesoría técnica (service, $150,000/hr)" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$PRODUCT_1" ]; then
  req POST "/products/$PRODUCT_1/inventory" '{"quantity": 200, "movementType": "purchase", "notes": "Compra inicial proveedor Argos"}'
  check "Inventory: +200 bultos cemento (purchase)" "$LAST_STATUS" "$LAST_BODY"

  req POST "/products/$PRODUCT_1/inventory" '{"quantity": 30, "movementType": "sale", "notes": "Venta a Almacenes El Triunfo"}'
  check "Inventory: -30 bultos cemento (sale)" "$LAST_STATUS" "$LAST_BODY"
fi

if [ -n "$PRODUCT_2" ]; then
  req POST "/products/$PRODUCT_2/inventory" '{"quantity": 500, "movementType": "purchase", "notes": "Compra Diaco"}'
  check "Inventory: +500 varillas (purchase)" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "━━━ 8. DEALS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEAL_DATA='{
  "title": "Suministro cemento Almacenes El Triunfo Q2",
  "valueCents": 175000000,
  "expectedCloseDate": "2026-04-15",
  "contactId": "'$CONTACT_ID'",
  "companyId": "'$COMPANY_ID'"'
if [ -n "$PIPELINE_ID" ] && [ -n "$STAGE_3" ]; then
  DEAL_DATA="$DEAL_DATA, \"pipelineId\": \"$PIPELINE_ID\", \"stageId\": \"$STAGE_3\""
fi
DEAL_DATA="$DEAL_DATA}"

req POST "/deals" "$DEAL_DATA"
check "Deal: Suministro cemento El Triunfo ($1,750,000 COP)" "$LAST_STATUS" "$LAST_BODY"
DEAL_ID=$(jq_extract "print(d.get('data',d).get('id',''))")
blue "Deal ID: $DEAL_ID"

req POST "/deals" '{
  "title": "Varilla para proyecto edificio La Nacional",
  "valueCents": 420000000,
  "expectedCloseDate": "2026-05-01",
  "contactId": "'$CONTACT_2_ID'",
  "companyId": "'$COMPANY_2_ID'"
}'
check "Deal: Varilla edificio La Nacional ($4,200,000 COP)" "$LAST_STATUS" "$LAST_BODY"
DEAL_2_ID=$(jq_extract "print(d.get('data',d).get('id',''))")

if [ -n "$DEAL_ID" ] && [ -n "$PRODUCT_1" ]; then
  req POST "/deals/$DEAL_ID/items" '{"productId":"'$PRODUCT_1'","description":"Cemento Portland Tipo I x 50kg","quantity":50,"unitPriceCents":3500000,"discountPercent":5,"ivaRate":19}'
  check "Deal item: 50 bultos cemento (5% descuento)" "$LAST_STATUS" "$LAST_BODY"
fi

if [ -n "$DEAL_ID" ]; then
  req PATCH "/deals/$DEAL_ID/won"
  check "Deal WON: Suministro cemento El Triunfo" "$LAST_STATUS" "$LAST_BODY"
  blue "Status: $(jq_extract "print(d.get('data',d).get('status',''))")"
fi

echo ""
echo "━━━ 9. ACTIVITIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/activities" '{
  "activityType": "call",
  "title": "Llamar a María López para confirmar pedido Q2",
  "dueDate": "2026-03-22T09:00:00Z",
  "contactId": "'$CONTACT_ID'",
  "dealId": "'$DEAL_ID'"
}'
check "Activity: Llamar a María López (call)" "$LAST_STATUS" "$LAST_BODY"
ACTIVITY_ID=$(jq_extract "print(d.get('data',d).get('id',''))")

req POST "/activities" '{
  "activityType": "meeting",
  "title": "Reunión con Andrés Ramírez para cotización varilla",
  "dueDate": "2026-03-25T14:00:00Z",
  "contactId": "'$CONTACT_2_ID'",
  "dealId": "'$DEAL_2_ID'",
  "durationMinutes": 60
}'
check "Activity: Reunión con Andrés (meeting, 60min)" "$LAST_STATUS" "$LAST_BODY"

req POST "/activities" '{
  "activityType": "note",
  "title": "Laura Martínez interesada en asesoría técnica",
  "description": "Laura llamó preguntando por servicios de asesoría para su proyecto. Enviar cotización."
}'
check "Activity: Nota sobre Laura (note)" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$ACTIVITY_ID" ]; then
  req PATCH "/activities/$ACTIVITY_ID/complete"
  check "Complete: Llamada a María completada" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "━━━ 10. MESSAGE TEMPLATES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/message-templates" '{
  "name": "Cotización de productos",
  "channel": "email",
  "subject": "Cotización {{referencia}} — Distribuidora Nexo",
  "body": "<h2>Estimado/a {{nombre}},</h2><p>Adjunto encontrará la cotización <strong>{{referencia}}</strong> por un valor de <strong>{{monto}}</strong>.</p><p>Quedamos atentos a su respuesta.</p><p>Cordialmente,<br/>Distribuidora Nexo SAS</p>",
  "category": "Ventas"
}'
check "Template: Cotización email (Handlebars)" "$LAST_STATUS" "$LAST_BODY"
TEMPLATE_ID=$(jq_extract "print(d.get('data',d).get('id',''))")
blue "Variables auto-detected: $(jq_extract "print(d.get('data',d).get('variables',[]))")"

req POST "/message-templates" '{
  "name": "Recordatorio de pago",
  "channel": "sms",
  "body": "Hola {{nombre}}, le recordamos que tiene una factura pendiente por {{monto}}. Pague en línea: {{link}}. Distribuidora Nexo.",
  "category": "Cobranza"
}'
check "Template: Recordatorio pago SMS" "$LAST_STATUS" "$LAST_BODY"

req POST "/message-templates" '{
  "name": "Bienvenida WhatsApp",
  "channel": "whatsapp",
  "body": "¡Hola {{nombre}}! 👋 Gracias por contactarnos. Soy {{vendedor}} de Distribuidora Nexo. ¿En qué puedo ayudarte?",
  "category": "Onboarding"
}'
check "Template: Bienvenida WhatsApp" "$LAST_STATUS" "$LAST_BODY"

if [ -n "$TEMPLATE_ID" ]; then
  req POST "/message-templates/$TEMPLATE_ID/preview" '{"nombre":"María López","referencia":"COT-2026-001","monto":"$1.750.000 COP"}'
  check "Preview: Cotización renderizada con datos reales" "$LAST_STATUS" "$LAST_BODY"
  blue "Subject: $(jq_extract "print(d.get('data',d).get('subject',''))")"
fi

echo ""
echo "━━━ 11. NOTIFICATIONS & PREFERENCES ━━━━━━━━━━━━━━━━━━━━━━━"

req GET "/notifications"
check "Get notifications (should have deal.won)" "$LAST_STATUS" "$LAST_BODY"
blue "Unread: $(jq_extract "print(d.get('data',d).get('unreadCount',0))")"

req PATCH "/notifications/preferences" '{"inApp":true,"email":true,"push":false,"mutedTypes":["stock.low"]}'
check "Update preferences: mute stock.low" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "━━━ 12. SAVED FILTERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/saved-filters" '{
  "entityType": "contact",
  "name": "Clientes VIP Bogotá",
  "filters": {"tags": ["VIP"], "city": "Bogotá", "status": "client"},
  "isDefault": true
}'
check "Saved filter: Clientes VIP Bogotá (default)" "$LAST_STATUS" "$LAST_BODY"

req POST "/saved-filters" '{
  "entityType": "deal",
  "name": "Negocios > $1M este mes",
  "filters": {"minValueCents": 100000000, "status": "open"}
}'
check "Saved filter: Negocios > $1M" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "━━━ 13. WEBHOOKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/webhooks" '{
  "url": "https://hooks.zapier.com/hooks/catch/12345/abcdef",
  "events": ["deal.won", "deal.lost", "contact.created", "invoice.approved"]
}'
check "Webhook: Zapier integration (deal.won, contact.created)" "$LAST_STATUS" "$LAST_BODY"
blue "Secret: $(jq_extract "print(d.get('data',d).get('secret','')[:20])...")..."

echo ""
echo "━━━ 14. API KEYS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req POST "/api-keys" '{"name":"Integración ERP Siigo","scopes":["contacts.read","companies.read","invoices.*"]}'
check "API Key: Integración ERP Siigo" "$LAST_STATUS" "$LAST_BODY"
blue "Raw key: $(jq_extract "print(d.get('data',d).get('rawKey','')[:20])...")..."
blue "Scopes: $(jq_extract "print(d.get('data',d).get('scopes',[]))")"

echo ""
echo "━━━ 15. TIMELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$CONTACT_ID" ]; then
  req GET "/contacts/$CONTACT_ID/timeline"
  check "Timeline: María López (should show call + deal)" "$LAST_STATUS" "$LAST_BODY"
  blue "Events: $(jq_extract "print(len(d.get('data',d).get('data',[])))")"
fi

if [ -n "$DEAL_ID" ]; then
  req GET "/deals/$DEAL_ID/timeline"
  check "Timeline: Deal Suministro cemento" "$LAST_STATUS" "$LAST_BODY"
fi

if [ -n "$COMPANY_ID" ]; then
  req GET "/companies/$COMPANY_ID/timeline"
  check "Timeline: Almacenes El Triunfo" "$LAST_STATUS" "$LAST_BODY"
fi

echo ""
echo "━━━ 16. DASHBOARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req GET "/dashboard"
check "Full dashboard" "$LAST_STATUS" "$LAST_BODY"
blue "Active deals: $(jq_extract "print(d.get('data',d).get('metrics',{}).get('activeDealsCount',0))")"
blue "Won this month: $(jq_extract "print(d.get('data',d).get('metrics',{}).get('wonDealsThisMonthCount',0))")"
blue "New contacts: $(jq_extract "print(d.get('data',d).get('metrics',{}).get('newContactsThisMonth',0))")"
blue "Pending activities: $(jq_extract "print(d.get('data',d).get('metrics',{}).get('pendingActivitiesCount',0))")"

req GET "/dashboard/pipeline-summary"
check "Pipeline summary" "$LAST_STATUS" "$LAST_BODY"

req GET "/dashboard/top-sales-reps"
check "Top sales reps" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "━━━ 17. SEARCH & LISTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req GET "/contacts?q=Laura"
check "Search contacts: 'Laura'" "$LAST_STATUS" "$LAST_BODY"
blue "Results: $(jq_extract "print(d.get('data',d).get('total',0))")"

req GET "/companies?q=triunfo"
check "Search companies: 'triunfo'" "$LAST_STATUS" "$LAST_BODY"

req GET "/products?category=Construccion"
check "Products filter: category=Construccion" "$LAST_STATUS" "$LAST_BODY"

req GET "/products/low-stock"
check "Products: low stock alert" "$LAST_STATUS" "$LAST_BODY"

req GET "/deals/forecast"
check "Deals forecast (weighted by probability)" "$LAST_STATUS" "$LAST_BODY"

req GET "/audit-log"
check "Audit log (should have all operations)" "$LAST_STATUS" "$LAST_BODY"
blue "Audit entries: $(jq_extract "print(len(d.get('data',d).get('data',[])))")"

echo ""
echo "━━━ 18. CLEANUP CHECK ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

req GET "/settings/general"
check "Final settings check" "$LAST_STATUS" "$LAST_BODY"

req GET "/settings/pipelines"
check "Final pipelines check" "$LAST_STATUS" "$LAST_BODY"

echo ""
echo "═══════════════════════════════════════════════════════════════"
printf "  RESULTS: \033[32m%d passed\033[0m / \033[31m%d failed\033[0m / %d total\n" "$PASS_COUNT" "$FAIL_COUNT" "$TOTAL"
echo "═══════════════════════════════════════════════════════════════"
echo ""

rm -f "$COOKIE_JAR"

if [ "$FAIL_COUNT" -gt 0 ]; then exit 1; fi
