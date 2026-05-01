#!/bin/bash

# ==============================================================================
# FixFlow EC2 Log Agent
# ==============================================================================
# This script monitors a log file (e.g. nginx error log, syslog, or node.js log)
# and streams it in real-time to your FixFlow Backend.
# ==============================================================================

# --- CONFIGURATION ---
# Replace this with your actual deployed backend URL (or local if testing via ngrok)
FIXFLOW_API_URL="http://localhost:5001/api/logs/agent/ingest"

# The token must match LOG_INGEST_TOKEN in your backend .env
AGENT_TOKEN="fixflow_secure_agent_token_2026"

# Replace with the actual Company ID from your FixFlow dashboard
COMPANY_ID="your_company_id_here"

# The log file you want to monitor (e.g., /var/log/nginx/error.log)
LOG_FILE="/var/log/syslog"

# Identifier for this server
SERVER_IP=$(curl -s http://checkip.amazonaws.com || echo "unknown-ip")
SOURCE="syslog"

echo "🚀 Starting FixFlow Log Agent..."
echo "📡 Streaming: $LOG_FILE"
echo "🌐 To: $FIXFLOW_API_URL"
echo "----------------------------------------"

# Ensure log file exists
if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Error: Log file $LOG_FILE does not exist!"
    exit 1
fi

# Tail the log file and pipe each new line to curl
tail -F "$LOG_FILE" | while read -r LINE; do
    
    # Very basic log level extraction (customize as needed)
    LEVEL="INFO"
    if echo "$LINE" | grep -qi "error\|err\|fatal"; then
        LEVEL="ERROR"
    elif echo "$LINE" | grep -qi "warn"; then
        LEVEL="WARN"
    fi

    # Create JSON payload securely using jq (if available) or basic string replacement
    # We use basic string replacement here to avoid requiring 'jq' to be installed
    SAFE_MESSAGE=$(echo "$LINE" | sed 's/"/\\"/g' | sed 's/\x27/\\\x27/g')
    
    PAYLOAD=$(cat <<EOF
{
  "companyId": "$COMPANY_ID",
  "serverIp": "$SERVER_IP",
  "source": "$SOURCE",
  "level": "$LEVEL",
  "message": "$SAFE_MESSAGE"
}
EOF
)

    # Send POST request to backend
    curl -s -X POST "$FIXFLOW_API_URL" \
         -H "Content-Type: application/json" \
         -H "x-agent-token: $AGENT_TOKEN" \
         -d "$PAYLOAD" > /dev/null

done
