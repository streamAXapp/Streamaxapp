import fs from 'fs/promises'
import path from 'path'

interface ComposeConfig {
  userId: string
  sessionId: string
  rtmpUrl: string
  videoSource: string
  sourceType: 'file' | 'youtube' | 'url'
  containerName?: string
}

export async function generateDockerCompose(config: ComposeConfig): Promise<string> {
  const timestamp = Date.now()
  const containerName = config.containerName || `streamax-${config.userId.substring(0, 8)}-${timestamp}`
  
  const composeContent = `version: '3.8'

services:
  ${containerName}:
    image: jrottenberg/ffmpeg:4.4-alpine
    container_name: ${containerName}
    restart: unless-stopped
    ${config.sourceType === 'file' ? `volumes:
      - /tmp/streamax/videos:/videos:ro` : ''}
    environment:
      - RTMP_URL=${config.rtmpUrl}
      - VIDEO_SOURCE=${config.videoSource}
      - SOURCE_TYPE=${config.sourceType}
    command: >
      sh -c "
        ${generateFFmpegCommand(config)}
      "
    networks:
      - streamax_network
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "ps", "aux", "|", "grep", "ffmpeg"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  streamax_network:
    external: true
`

  return composeContent
}

function generateFFmpegCommand(config: ComposeConfig): string {
  const baseFFmpegOpts = [
    '-re',
    '-stream_loop -1',
    '-c:v libx264',
    '-preset veryfast',
    '-maxrate 3000k',
    '-bufsize 6000k',
    '-pix_fmt yuv420p',
    '-g 50',
    '-c:a aac',
    '-b:a 160k',
    '-ac 2',
    '-ar 44100',
    '-f flv'
  ].join(' ')

  switch (config.sourceType) {
    case 'file':
      return `ffmpeg -i /videos/${config.videoSource} ${baseFFmpegOpts} "${config.rtmpUrl}"`
    
    case 'youtube':
      return `
        apk add --no-cache python3 py3-pip && 
        pip3 install yt-dlp &&
        DIRECT_URL=$(yt-dlp -f 'best[height<=720]' -g '${config.videoSource}' | head -1) &&
        ffmpeg -i "$DIRECT_URL" ${baseFFmpegOpts} "${config.rtmpUrl}"
      `
    
    case 'url':
      return `ffmpeg -i '${config.videoSource}' ${baseFFmpegOpts} "${config.rtmpUrl}"`
    
    default:
      throw new Error(`Unsupported source type: ${config.sourceType}`)
  }
}

export async function saveComposeFile(config: ComposeConfig, outputDir: string = '/tmp/streamax/compose'): Promise<string> {
  const composeContent = await generateDockerCompose(config)
  const timestamp = Date.now()
  const filename = `docker-compose-${config.userId.substring(0, 8)}-${timestamp}.yml`
  const filepath = path.join(outputDir, filename)
  
  // Ensure directory exists
  await fs.mkdir(outputDir, { recursive: true })
  
  // Write compose file
  await fs.writeFile(filepath, composeContent, 'utf8')
  
  return filepath
}

export async function cleanupOldComposeFiles(directory: string = '/tmp/streamax/compose', maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
  try {
    const files = await fs.readdir(directory)
    const now = Date.now()
    
    for (const file of files) {
      if (file.startsWith('docker-compose-') && file.endsWith('.yml')) {
        const filepath = path.join(directory, file)
        const stats = await fs.stat(filepath)
        const fileAge = now - stats.mtime.getTime()
        
        if (fileAge > maxAge) {
          await fs.unlink(filepath)
          console.log(`Cleaned up old compose file: ${file}`)
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up compose files:', error)
  }
}

// Utility function to validate compose configuration
export function validateComposeConfig(config: ComposeConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!config.userId || config.userId.length < 8) {
    errors.push('Invalid user ID')
  }
  
  if (!config.sessionId || config.sessionId.length < 8) {
    errors.push('Invalid session ID')
  }
  
  if (!config.rtmpUrl || !config.rtmpUrl.startsWith('rtmp://')) {
    errors.push('Invalid RTMP URL')
  }
  
  if (!config.videoSource) {
    errors.push('Video source is required')
  }
  
  if (!['file', 'youtube', 'url'].includes(config.sourceType)) {
    errors.push('Invalid source type')
  }
  
  if (config.sourceType === 'youtube' && !config.videoSource.includes('youtube.com') && !config.videoSource.includes('youtu.be')) {
    errors.push('Invalid YouTube URL')
  }
  
  if (config.sourceType === 'url' && !config.videoSource.startsWith('http')) {
    errors.push('Invalid video URL')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}