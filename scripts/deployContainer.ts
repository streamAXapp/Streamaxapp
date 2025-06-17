import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

interface DeploymentConfig {
  userId: string
  sessionId: string
  rtmpUrl: string
  videoSource: string
  sourceType: 'file' | 'youtube' | 'url'
}

interface DeploymentResult {
  success: boolean
  containerId?: string
  containerName?: string
  error?: string
}

export class ContainerDeployer {
  private readonly networkName = 'streamax_network'
  private readonly imageName = 'jrottenberg/ffmpeg:4.4-alpine'
  
  async deployStreamContainer(config: DeploymentConfig): Promise<DeploymentResult> {
    try {
      // Ensure network exists
      await this.ensureNetwork()
      
      // Generate container name
      const containerName = `streamax-${config.userId.substring(0, 8)}-${config.sessionId.substring(0, 8)}`
      
      // Prepare Docker command
      const dockerCommand = this.buildDockerCommand(containerName, config)
      
      console.log('Deploying container:', containerName)
      console.log('Docker command:', dockerCommand)
      
      // Execute Docker command
      const { stdout, stderr } = await execAsync(dockerCommand)
      
      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(`Docker error: ${stderr}`)
      }
      
      const containerId = stdout.trim()
      
      // Verify container is running
      await this.waitForContainer(containerId)
      
      return {
        success: true,
        containerId,
        containerName
      }
      
    } catch (error: any) {
      console.error('Container deployment failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  async stopStreamContainer(containerId: string): Promise<DeploymentResult> {
    try {
      console.log('Stopping container:', containerId)
      
      // Stop container
      await execAsync(`docker stop ${containerId}`)
      
      // Remove container
      await execAsync(`docker rm ${containerId}`)
      
      return { success: true }
      
    } catch (error: any) {
      console.error('Container stop failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  async getContainerStatus(containerId: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker inspect --format='{{.State.Status}}' ${containerId}`)
      return stdout.trim()
    } catch (error) {
      return 'not_found'
    }
  }
  
  async listStreamContainers(): Promise<Array<{id: string, name: string, status: string}>> {
    try {
      const { stdout } = await execAsync(`docker ps -a --filter "name=streamax-" --format "{{.ID}}\t{{.Names}}\t{{.Status}}"`)
      
      return stdout.trim().split('\n').filter(line => line).map(line => {
        const [id, name, status] = line.split('\t')
        return { id, name, status }
      })
    } catch (error) {
      return []
    }
  }
  
  private async ensureNetwork(): Promise<void> {
    try {
      // Check if network exists
      await execAsync(`docker network inspect ${this.networkName}`)
    } catch (error) {
      // Create network if it doesn't exist
      console.log('Creating Docker network:', this.networkName)
      await execAsync(`docker network create ${this.networkName}`)
    }
  }
  
  private buildDockerCommand(containerName: string, config: DeploymentConfig): string {
    const baseCommand = [
      'docker run',
      '-d',
      `--name ${containerName}`,
      '--rm',
      '--memory=1g',
      '--cpus=1.0',
      `--network ${this.networkName}`
    ]
    
    // Add volume mount for file sources
    if (config.sourceType === 'file') {
      baseCommand.push('-v /tmp/streamax/videos:/videos:ro')
    }
    
    // Add image
    baseCommand.push(this.imageName)
    
    // Add streaming script
    baseCommand.push('/app/stream.sh')
    baseCommand.push(`"${config.videoSource}"`)
    baseCommand.push(`"${config.rtmpUrl}"`)
    baseCommand.push(config.sourceType)
    
    return baseCommand.join(' ')
  }
  
  private async waitForContainer(containerId: string, maxWaitTime = 30000): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getContainerStatus(containerId)
      
      if (status === 'running') {
        return
      }
      
      if (status === 'exited' || status === 'dead') {
        throw new Error(`Container failed to start: ${status}`)
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    throw new Error('Container start timeout')
  }
}

// Utility functions for external use
export async function deployContainer(config: DeploymentConfig): Promise<DeploymentResult> {
  const deployer = new ContainerDeployer()
  return await deployer.deployStreamContainer(config)
}

export async function stopContainer(containerId: string): Promise<DeploymentResult> {
  const deployer = new ContainerDeployer()
  return await deployer.stopStreamContainer(containerId)
}

export async function getContainerStatus(containerId: string): Promise<string> {
  const deployer = new ContainerDeployer()
  return await deployer.getContainerStatus(containerId)
}

export async function listContainers(): Promise<Array<{id: string, name: string, status: string}>> {
  const deployer = new ContainerDeployer()
  return await deployer.listStreamContainers()
}