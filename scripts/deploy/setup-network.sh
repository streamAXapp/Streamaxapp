#!/bin/bash

# Setup Docker network for StreamAX
# Usage: ./setup-network.sh

set -e

NETWORK_NAME="streamax_network"

echo "Setting up Docker network: $NETWORK_NAME"

# Check if network already exists
if docker network ls | grep -q "$NETWORK_NAME"; then
    echo "Network $NETWORK_NAME already exists"
else
    # Create the network
    docker network create "$NETWORK_NAME"
    echo "Network $NETWORK_NAME created successfully"
fi

# Show network info
docker network ls | grep "$NETWORK_NAME"