import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
})

export async function cloneVoice(file: File, name: string) {
  try {
    // Convert File to Blob and then to stream for ElevenLabs API
    const blob = new Blob([file])
    const stream = blob.stream()
    
    const voice = await client.voices.ivc.create({
      name: name,
      files: [stream as any]
    })
    
    return voice.voice_id
  } catch (error) {
    console.error('Voice cloning error:', error)
    throw new Error('Failed to clone voice')
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