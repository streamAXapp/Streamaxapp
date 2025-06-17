#!/bin/bash

# StreamAX FFmpeg Streaming Script
# Usage: ./stream.sh <video_source> <rtmp_url> <source_type>

set -e

VIDEO_SOURCE="$1"
RTMP_URL="$2"
SOURCE_TYPE="$3"

if [ -z "$VIDEO_SOURCE" ] || [ -z "$RTMP_URL" ] || [ -z "$SOURCE_TYPE" ]; then
    echo "Usage: $0 <video_source> <rtmp_url> <source_type>"
    echo "Source types: file, youtube, url"
    exit 1
fi

echo "Starting StreamAX FFmpeg streaming..."
echo "Video Source: $VIDEO_SOURCE"
echo "Source Type: $SOURCE_TYPE"
echo "RTMP URL: ${RTMP_URL:0:30}..."

# Common FFmpeg options for streaming
FFMPEG_OPTS=(
    -re
    -stream_loop -1
    -c:v libx264
    -preset veryfast
    -maxrate 3000k
    -bufsize 6000k
    -pix_fmt yuv420p
    -g 50
    -c:a aac
    -b:a 160k
    -ac 2
    -ar 44100
    -f flv
)

case "$SOURCE_TYPE" in
    "file")
        echo "Streaming from video file..."
        if [ ! -f "/videos/$VIDEO_SOURCE" ]; then
            echo "Error: Video file not found: /videos/$VIDEO_SOURCE"
            exit 1
        fi
        ffmpeg -i "/videos/$VIDEO_SOURCE" "${FFMPEG_OPTS[@]}" "$RTMP_URL"
        ;;
    
    "youtube")
        echo "Streaming from YouTube URL..."
        # Install yt-dlp if not available
        if ! command -v yt-dlp &> /dev/null; then
            echo "Installing yt-dlp..."
            apk add --no-cache python3 py3-pip
            pip3 install yt-dlp
        fi
        
        # Get direct video URL from YouTube
        DIRECT_URL=$(yt-dlp -f "best[height<=720]" -g "$VIDEO_SOURCE" | head -1)
        if [ -z "$DIRECT_URL" ]; then
            echo "Error: Could not extract video URL from YouTube"
            exit 1
        fi
        
        echo "Direct URL extracted, starting stream..."
        ffmpeg -i "$DIRECT_URL" "${FFMPEG_OPTS[@]}" "$RTMP_URL"
        ;;
    
    "url")
        echo "Streaming from direct URL..."
        ffmpeg -i "$VIDEO_SOURCE" "${FFMPEG_OPTS[@]}" "$RTMP_URL"
        ;;
    
    *)
        echo "Error: Unknown source type: $SOURCE_TYPE"
        echo "Supported types: file, youtube, url"
        exit 1
        ;;
esac