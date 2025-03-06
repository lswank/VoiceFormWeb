#!/bin/bash

# Kill any process using ports 5173-5180
echo "🔪 Killing any processes using ports 5173-5180..."
for port in {5173..5180}; do
  PIDS=$(lsof -ti:$port)
  if [ ! -z "$PIDS" ]; then
    echo "   Killing processes on port $port: $PIDS"
    kill -9 $PIDS
  fi
done

# Start the app with mock API enabled on port 5173
echo "🚀 Starting app on port 5173 with mock API enabled..."
VITE_USE_MOCK_API=true PORT=5173 npx vite 