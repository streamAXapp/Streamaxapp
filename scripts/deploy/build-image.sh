#!/bin/bash

# Build FFmpeg streaming Docker image
# Usage: ./build-image.sh [tag]

set -e

TAG=${1:-"streamax-ffmpeg:latest"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/../docker"

echo "Building StreamAX FFmpeg Docker image..."
echo "Tag: $TAG"

# Build the image
docker build -t "$TAG" -f "$DOCKER_DIR/ffmpeg.Dockerfile" "$DOCKER_DIR"

echo "Image built successfully: $TAG"

# Show image info
docker images | grep streamax-ffmpeg