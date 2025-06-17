#!/bin/bash

# Start a streaming container
# Usage: ./start-container.sh <container_name> <video_source> <rtmp_url> <source_type>

set -e

CONTAINER_NAME="$1"
VIDEO_SOURCE="$2"
RTMP_URL="$3"
SOURCE_TYPE="$4"

if [ -z "$CONTAINER_NAME" ] || [ -z "$VIDEO_SOURCE" ] || [ -z "$RTMP_URL" ] || [ -z "$SOURCE_TYPE" ]; then
    echo "Usage: $0 <container_name> <video_source> <rtmp_url> <source_type>"
    echo "Source types: file, youtube, url"
    exit 1
fi

IMAGE_NAME="streamax-ffmpeg:latest"
NETWORK_NAME="streamax_network"

echo "Starting streaming container..."
echo "Container: $CONTAINER_NAME"
echo "Video Source: $VIDEO_SOURCE"
echo "Source Type: $SOURCE_TYPE"

# Prepare docker run command
DOCKER_ARGS=(
    "run"
    "-d"
    "--name" "$CONTAINER_NAME"
    "--network" "$NETWORK_NAME"
    "--restart" "unless-stopped"
    "--memory" "1g"
    "--cpus" "1.0"
)

# Add volume mount for file sources
if [ "$SOURCE_TYPE" = "file" ]; then
    DOCKER_ARGS+=("-v" "/tmp/streamax/videos:/app/videos:ro")
fi

# Add image and command
DOCKER_ARGS+=("$IMAGE_NAME")
DOCKER_ARGS+=("/app/stream.sh" "$VIDEO_SOURCE" "$RTMP_URL" "$SOURCE_TYPE")

# Start the container
CONTAINER_ID=$(docker "${DOCKER_ARGS[@]}")

echo "Container started successfully!"
echo "Container ID: $CONTAINER_ID"
echo "Container Name: $CONTAINER_NAME"

# Show container status
sleep 2
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"