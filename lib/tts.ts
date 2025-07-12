import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { Readable } from 'stream'

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
})

export async function cloneVoice(file: File, name: string) {
  try {
    console.log('Starting voice cloning for:', name, 'File size:', file.size, 'File type:', file.type)
    
    // Convert File to Buffer and then to Node.js readable stream
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Create a Node.js readable stream from the buffer
    const stream = new Readable({
      read() {
        this.push(buffer)
        this.push(null) // End the stream
      }
    })
    
    const voice = await client.voices.ivc.create({
      name: name,
      files: [stream]
    })
    
    console.log('Voice cloning response:', JSON.stringify(voice, null, 2))
    
    // Check different possible property names for the voice ID
    const voiceId = voice.voice_id || voice.id || voice.voiceId
    
    if (!voiceId) {
      console.error('No voice ID found in response. Available properties:', Object.keys(voice))
      throw new Error('No voice ID returned from ElevenLabs API')
    }
    
    return voiceId
  } catch (error) {
    console.error('Voice cloning error:', error)
    throw new Error(`Failed to clone voice: ${error.message}`)
  }
}

export async function speak(voiceId: string, text: string) {
  try {
    const audio = await client.textToSpeech.convert({
      voice_id: voiceId,
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    })

    // Convert the audio response to a Uint8Array
    const chunks: Uint8Array[] = []
    for await (const chunk of audio) {
      chunks.push(chunk)
    }

    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return result
  } catch (error) {
    console.error('Text-to-speech error:', error)
    throw new Error('Failed to generate speech')
  }
}

export async function getVoices() {
  try {
    const response = await client.voices.getAll()
    return response.voices
  } catch (error) {
    console.error('Get voices error:', error)
    throw new Error('Failed to get voices')
  }
}