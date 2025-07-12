import TelegramBot from 'node-telegram-bot-api'
import { createServerActionClient } from './supabase-server'

export interface TelegramUser {
	id: string
	telegram_id: number
	user_id: string
	username?: string
	first_name?: string
	last_name?: string
	created_at: string
}

export interface ConversationState {
	conversationId?: string
	personId?: string
	awaitingResponse?: boolean
}

class TelegramBotService {
	private bot: TelegramBot | null = null
	private conversationStates: Map<number, ConversationState> = new Map()

	constructor() {
		if (process.env.TELEGRAM_BOT_TOKEN) {
			this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
				polling: false
			})
		}
	}

	getBot(): TelegramBot | null {
		return this.bot
	}

	async findOrCreateTelegramUser(telegramUser: TelegramBot.User): Promise<TelegramUser | null> {
		const supabase = await createServerActionClient()

		const { data: existingUser, error } = await supabase
			.from('telegram_users')
			.select('*')
			.eq('telegram_id', telegramUser.id)
			.single()

		if (existingUser) {
			return existingUser
		}

		if (error && error.code === 'PGRST116') {
			return null
		}

		if (error) {
			throw new Error(`Database error: ${error.message}`)
		}

		return null
	}

	async findTelegramUserByUserId(userId: string): Promise<TelegramUser | null> {
		const supabase = await createServerActionClient()

		const { data: existingUser, error } = await supabase
			.from('telegram_users')
			.select('*')
			.eq('user_id', userId)
			.single()

		if (existingUser) {
			return existingUser
		}

		if (error && error.code === 'PGRST116') {
			return null
		}

		if (error) {
			throw new Error(`Database error: ${error.message}`)
		}

		return null
	}

	async linkTelegramToUser(telegramUser: TelegramBot.User, userId: string): Promise<TelegramUser> {
		const supabase = await createServerActionClient()

		const { data, error } = await supabase
			.from('telegram_users')
			.insert({
				telegram_id: telegramUser.id,
				user_id: userId,
				username: telegramUser.username,
				first_name: telegramUser.first_name,
				last_name: telegramUser.last_name,
			})
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to link Telegram user: ${error.message}`)
		}

		return data
	}


	async getUserPersonas(userId: string) {
		const supabase = await createServerActionClient()

		const { data: personas, error } = await supabase
			.from('persons')
			.select('*')
			.eq('user_id', userId)

		console.log("hello", personas, userId, error)

		if (error) {
			throw new Error(`Failed to get personas: ${error.message}`)
		}

		return personas || []
	}

	async validateAndUseLinkCode(code: string, telegramUser: TelegramBot.User): Promise<TelegramUser> {
		const supabase = await createServerActionClient()

		console.log('Validating link code:', code, 'for user:', telegramUser.id)

		// Find valid, unused, non-expired code (RLS disabled so this should work now)
		const { data: linkCode, error: findError } = await supabase
			.from('telegram_link_codes')
			.select('*')
			.eq('code', code)
			.eq('used', false)
			.gt('expires_at', new Date().toISOString())
			.single()

		console.log('Link code query result:', { linkCode, findError })

		if (findError || !linkCode) {
			throw new Error('Invalid or expired link code')
		}

		// Check if this Telegram user is already linked
		const existingLink = await this.findOrCreateTelegramUser(telegramUser)
		if (existingLink) {
			throw new Error('This Telegram account is already linked to another user')
		}

		// Mark code as used
		const { error: updateError } = await supabase
			.from('telegram_link_codes')
			.update({ used: true })
			.eq('code', code)

		if (updateError) {
			throw new Error('Failed to update link code')
		}

		// Create telegram_users entry
		const linkedUser = await this.linkTelegramToUser(telegramUser, linkCode.user_id)

		return linkedUser
	}

	async createConversation(personId: string, title?: string) {
		const supabase = await createServerActionClient()

		const { data, error } = await supabase
			.from('conversations')
			.insert({
				person_id: personId,
				title: title || 'Telegram Chat'
			})
			.select()
			.single()

		if (error) {
			throw new Error(`Failed to create conversation: ${error.message}`)
		}

		return data
	}

	setConversationState(telegramId: number, state: ConversationState) {
		this.conversationStates.set(telegramId, state)
	}

	getConversationState(telegramId: number): ConversationState | undefined {
		return this.conversationStates.get(telegramId)
	}

	clearConversationState(telegramId: number) {
		this.conversationStates.delete(telegramId)
	}

	async sendMessage(chatId: number, text: string, options?: TelegramBot.SendMessageOptions) {
		if (!this.bot) {
			throw new Error('Telegram bot not initialized')
		}
		return this.bot.sendMessage(chatId, text, options)
	}

	async sendAudio(chatId: number, audio: Buffer | string, options?: TelegramBot.SendAudioOptions) {
		if (!this.bot) {
			throw new Error('Telegram bot not initialized')
		}
		return this.bot.sendAudio(chatId, audio, options)
	}

	async sendVoice(chatId: number, voice: Buffer | string, options?: TelegramBot.SendVoiceOptions) {
		if (!this.bot) {
			throw new Error('Telegram bot not initialized')
		}
		return this.bot.sendVoice(chatId, voice, options)
	}

	async getFile(fileId: string): Promise<TelegramBot.File> {
		if (!this.bot) {
			throw new Error('Telegram bot not initialized')
		}
		return this.bot.getFile(fileId)
	}

	async downloadFile(fileId: string, downloadDir?: string): Promise<string> {
		if (!this.bot) {
			throw new Error('Telegram bot not initialized')
		}
		return this.bot.downloadFile(fileId, downloadDir || '/tmp')
	}
}

export const telegramBot = new TelegramBotService()
