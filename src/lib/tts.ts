import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';

const client = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY!,
});

export async function cloneVoice(file: File, name: string) {
	try {
		// Convert File to Buffer and then to Node.js readable stream
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Create a Node.js readable stream from the buffer
		const stream = new Readable({
			read() {
				this.push(buffer);
				this.push(null); // End the stream
			},
		});

		const voice = await client.voices.ivc.create({
			name: name,
			files: [stream],
		});

		// Check different possible property names for the voice ID
		const voiceId = voice.voiceId;

		if (!voiceId) {
			console.error('No voice ID found in response. Available properties:', Object.keys(voice));
			throw new Error('No voice ID returned from ElevenLabs API');
		}

		return voiceId;
	} catch (error) {
		console.error('Voice cloning error:', error);
		throw new Error(`Failed to clone voice: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

export async function speak(voiceId: string, text: string) {
	try {
		// Use the correct ElevenLabs API method from the documentation
		const audio = await client.textToSpeech.convert(voiceId, {
			text,
			modelId: 'eleven_multilingual_v2',
			outputFormat: 'mp3_44100_128',
		});

		// The audio response should be a ReadableStream, let's handle it properly
		const chunks: Buffer[] = [];

		if (audio instanceof ReadableStream) {
			// It's a ReadableStream, read it properly
			const reader = audio.getReader();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					chunks.push(Buffer.from(value));
				}
			} finally {
				reader.releaseLock();
			}
		} else {
			// Fallback: try to convert to buffer
			chunks.push(Buffer.from(audio as unknown as ArrayBuffer));
		}

		// Combine all chunks into a single Buffer
		const result = Buffer.concat(chunks);

		// Validate that it looks like an MP3 file (should start with ID3 tag or sync frame)
		if (result.length < 10) {
			throw new Error('Audio buffer too small, likely corrupted');
		}

		// Check for MP3 signatures
		const hasID3 = result.subarray(0, 3).toString() === 'ID3';
		const hasSyncFrame = result[0] === 0xff && (result[1] & 0xe0) === 0xe0;

		if (!hasID3 && !hasSyncFrame) {
			console.error('Generated audio does not appear to be valid MP3 format');
			throw new Error('Invalid MP3 audio generated');
		}

		return result;
	} catch (error) {
		console.error('Text-to-speech error:', error);
		throw new Error('Failed to generate speech');
	}
}

export async function getVoices() {
	try {
		const response = await client.voices.getAll();
		return response.voices;
	} catch (error) {
		console.error('Get voices error:', error);
		throw new Error('Failed to get voices');
	}
}
