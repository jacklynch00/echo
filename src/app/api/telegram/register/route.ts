import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/src/lib/auth'
import { telegramBot } from '@/src/lib/telegram'

export async function POST(request: NextRequest) {
	try {
		// Get the authenticated user from Supabase session
		const user = await getUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { telegram_id, username, first_name, last_name } = await request.json()

		if (!telegram_id) {
			return NextResponse.json({ error: 'telegram_id is required' }, { status: 400 })
		}

		// Check if this Telegram user is already linked
		const existingTelegramUser = await telegramBot.findOrCreateTelegramUser({
			id: telegram_id,
			username,
			first_name,
			last_name,
			is_bot: false
		})

		console.log("hello", existingTelegramUser)

		if (existingTelegramUser) {
			return NextResponse.json({
				error: 'This Telegram account is already linked to another user'
			}, { status: 409 })
		}

		// Link the Telegram user to the current Supabase user
		const telegramUser = await telegramBot.linkTelegramToUser(
			{
				id: telegram_id,
				username,
				first_name,
				last_name,
				is_bot: false
			},
			user.id
		)

		return NextResponse.json({
			success: true,
			telegram_user: telegramUser
		})

	} catch (error) {
		console.error('Telegram registration error:', error)
		return NextResponse.json(
			{ error: 'Failed to register Telegram account' },
			{ status: 500 }
		)
	}
}

export async function GET(request: NextRequest) {
	try {
		// Get the authenticated user from Supabase session
		const user = await getUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check if user already has a linked Telegram account
		const telegramUser = await telegramBot.findTelegramUserByUserId(user.id)

		return NextResponse.json({
			has_telegram_account: !!telegramUser,
			telegram_user: telegramUser
		})

	} catch (error) {
		console.error('Telegram registration check error:', error)
		return NextResponse.json(
			{ error: 'Failed to check Telegram registration' },
			{ status: 500 }
		)
	}
}
