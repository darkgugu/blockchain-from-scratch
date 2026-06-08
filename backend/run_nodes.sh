#!/bin/bash

# Launch 3 blockchain nodes and register them as peers
BACKEND_DIR="$(cd "$(dirname "$0")" && pwd)"

# Use CONDA_PYTHON_EXE if conda is active (inherited by subprocesses even in
# non-interactive shells where conda's PATH changes are not sourced).
# Falls back to python3 for non-conda environments.
PYTHON="${CONDA_PYTHON_EXE:-python3}"

echo "Starting 3 blockchain nodes..."

"$PYTHON" "$BACKEND_DIR/node.py" --port 5001 &
PID1=$!
"$PYTHON" "$BACKEND_DIR/node.py" --port 5002 &
PID2=$!
"$PYTHON" "$BACKEND_DIR/node.py" --port 5003 &
PID3=$!

echo "Nodes starting on ports 5001, 5002, 5003 (PIDs: $PID1, $PID2, $PID3)"
echo "Waiting 2 seconds for nodes to initialize..."
sleep 2

# Register all peers with each node
echo "Registering peers..."

curl -s -X POST http://localhost:5001/nodes/register \
  -H "Content-Type: application/json" \
  -d '{"nodes": ["http://localhost:5002", "http://localhost:5003"]}' > /dev/null

curl -s -X POST http://localhost:5002/nodes/register \
  -H "Content-Type: application/json" \
  -d '{"nodes": ["http://localhost:5001", "http://localhost:5003"]}' > /dev/null

curl -s -X POST http://localhost:5003/nodes/register \
  -H "Content-Type: application/json" \
  -d '{"nodes": ["http://localhost:5001", "http://localhost:5002"]}' > /dev/null

echo "Peers registered. Network ready."
echo "Press Ctrl+C to stop all nodes."

# Wait for any node to exit, then kill all
wait $PID1 $PID2 $PID3
