# FFmpeg Dockerfile for streaming
FROM jrottenberg/ffmpeg:4.4-alpine

# Install additional tools
RUN apk add --no-cache \
    curl \
    python3 \
    py3-pip \
    && pip3 install --no-cache-dir yt-dlp

# Create working directory
WORKDIR /app

# Create videos directory
RUN mkdir -p /app/videos

# Copy streaming script
COPY stream.sh /app/stream.sh
RUN chmod +x /app/stream.sh

# Set default command
CMD ["/app/stream.sh"]