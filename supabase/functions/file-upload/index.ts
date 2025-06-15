/*
  # File Upload Edge Function

  1. Purpose
    - Handles video file uploads
    - Validates file types and sizes
    - Stores files securely for streaming
    - Returns file paths for streaming

  2. Features
    - Multi-part file upload
    - File validation (type, size)
    - Secure file storage
    - Cleanup of old files
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const ALLOWED_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'];

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('video') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    if (!userId) {
      throw new Error('User ID required');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB. Maximum allowed: 2GB`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().substring(0, 8);
    const extension = file.name.split('.').pop() || 'mp4';
    const filename = `${userId}-${timestamp}-${randomId}.${extension}`;
    const filepath = `/tmp/videos/${filename}`;

    // Ensure videos directory exists
    try {
      await Deno.mkdir('/tmp/videos', { recursive: true });
    } catch (error) {
      // Directory might already exist
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }

    // Save file to disk
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await Deno.writeFile(filepath, uint8Array);

    // Verify file was written correctly
    const fileInfo = await Deno.stat(filepath);
    if (fileInfo.size !== file.size) {
      throw new Error('File upload verification failed');
    }

    console.log(`File uploaded successfully: ${filename} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Clean up old files (optional background task)
    EdgeRuntime.waitUntil(cleanupOldFiles());

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        filepath,
        size: file.size,
        type: file.type,
        message: 'File uploaded successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('File upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function cleanupOldFiles() {
  try {
    const videosDir = '/tmp/videos';
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();

    // Check if directory exists
    try {
      const dirInfo = await Deno.stat(videosDir);
      if (!dirInfo.isDirectory) {
        return;
      }
    } catch {
      return; // Directory doesn't exist
    }

    // Read directory contents
    for await (const dirEntry of Deno.readDir(videosDir)) {
      if (dirEntry.isFile) {
        const filePath = `${videosDir}/${dirEntry.name}`;
        try {
          const fileInfo = await Deno.stat(filePath);
          const fileAge = now - (fileInfo.mtime?.getTime() || 0);

          if (fileAge > maxAge) {
            await Deno.remove(filePath);
            console.log(`Cleaned up old file: ${dirEntry.name}`);
          }
        } catch (error) {
          console.warn(`Error processing file ${dirEntry.name}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}