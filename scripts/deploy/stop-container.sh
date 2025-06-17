#!/bin/bash

# Stop a streaming container
# Usage: ./stop-container.sh <container_name>

set -e

CONTAINER_NAME="$1"

if [ -z "$CONTAINER_NAME" ]; then
    echo "Usage: $0 <container_name>"
    exit 1
fi

echo "Stopping container: $CONTAINER_NAME"

# Check if container exists
if ! docker ps -a --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "^$CONTAINER_NAME$"; then
    echo "Container $CONTAINER_NAME not found"
    exit 1
fi

# Stop the container
docker stop "$CONTAINER_NAME" || echo "Container was already stopped"

# Remove the container
docker rm "$CONTAINER_NAME" || echo "Container was already removed"

echo "Container $CONTAINER_NAME stopped and removed successfully"