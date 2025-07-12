import { NextRequest, NextResponse } from 'next/server'
import TelegramBot from 'node-telegram-bot-api'
import { telegramBot } from '@/src/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const update: TelegramBot.Update = body

    console.log('Received Telegram update:', JSON.stringify(update, null, 2))

    if (!update.message) {
      return NextResponse.json({ ok: true })
    }

    const message = update.message
    const chatId = message.chat.id
    const telegramUser = message.from

    if (!telegramUser) {
      return NextResponse.json({ ok: true })
    }

    try {
      await handleMessage(message, telegramUser)
    } catch (error) {
      console.error('Error handling message:', error)
      await telegramBot.sendMessage(
        chatId,
        'Sorry, I encountered an error processing your message. Please try again.'
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handleMessage(message: TelegramBot.Message, telegramUser: TelegramBot.User) {
  const chatId = message.chat.id
  const text = message.text?.trim()

  // Handle voice messages
  if (message.voice) {
    await handleVoiceMessage(message, telegramUser)
    return
  }

  if (!text) {
    return
  }

  // Handle commands
  if (text.startsWith('/')) {
    await handleCommand(message, telegramUser)
    return
  }

  // Handle regular messages (chat with persona)
  await handleChatMessage(message, telegramUser)
}

async function handleCommand(message: TelegramBot.Message, telegramUser: TelegramBot.User) {
  const chatId = message.chat.id
  const text = message.text?.trim()

  if (!text) return

  const [command, ...args] = text.split(' ')
  const argument = args.join(' ')

  switch (command) {
    case '/start':
      await handleStartCommand(chatId, telegramUser)
      break

    case '/personas':
      await handlePersonasCommand(chatId, telegramUser)
      break

    case '/chat':
      await handleChatCommand(chatId, telegramUser, argument)
      break

    case '/stop':
      await handleStopCommand(chatId, telegramUser)
      break

    case '/help':
      await handleHelpCommand(chatId)
      break

    case '/link':
      await handleLinkCommand(chatId, telegramUser, argument)
      break

    default:
      await telegramBot.sendMessage(
        chatId,
        'Unknown command. Use /help to see available commands.'
      )
  }
}

async function handleStartCommand(chatId: number, telegramUser: TelegramBot.User) {
  try {
    const existingUser = await telegramBot.findOrCreateTelegramUser(telegramUser)
    
    if (existingUser) {
      const personas = await telegramBot.getUserPersonas(existingUser.user_id)
      
      if (personas.length > 0) {
        await telegramBot.sendMessage(
          chatId,
          `Welcome back, ${telegramUser.first_name}! 👋\n\n` +
          `You have ${personas.length} persona(s) available.\n` +
          `Use /personas to see them or /chat <name> to start chatting.`
        )
      } else {
        await telegramBot.sendMessage(
          chatId,
          `Welcome back, ${telegramUser.first_name}! 👋\n\n` +
          `You don't have any personas yet. Visit ${process.env.APP_URL} to create your first persona!`
        )
      }
    } else {
      // User not linked yet - show linking instructions
      await telegramBot.sendMessage(
        chatId,
        `Welcome to Echo, ${telegramUser.first_name}! 👋\n\n` +
        `To get started:\n\n` +
        `1. Visit ${process.env.APP_URL} to create your account\n` +
        `2. Upload voice samples to create personas\n` +
        `3. Get your 6-digit link code from the dashboard\n` +
        `4. Come back here and send: \`/link YOUR_CODE\`\n\n` +
        `This bot allows you to chat with AI personas using cloned voices of your loved ones.`,
        { parse_mode: 'Markdown' }
      )
    }
  } catch (error) {
    console.error('Start command error:', error)
    await telegramBot.sendMessage(
      chatId,
      'Sorry, I encountered an error. Please try again later.'
    )
  }
}

async function handlePersonasCommand(chatId: number, telegramUser: TelegramBot.User) {
  try {
    const user = await telegramBot.findOrCreateTelegramUser(telegramUser)
    
    if (!user) {
      await telegramBot.sendMessage(
        chatId,
        'You need to create an account first. Use /start for instructions.'
      )
      return
    }

    const personas = await telegramBot.getUserPersonas(user.user_id)
    
    if (personas.length === 0) {
      await telegramBot.sendMessage(
        chatId,
        'You don\'t have any personas yet. Please create one at your web dashboard first.'
      )
      return
    }

    const personaList = personas
      .map((persona, index) => `${index + 1}. **${persona.name}** (${persona.relationship})`)
      .join('\n')

    await telegramBot.sendMessage(
      chatId,
      `Your personas:\n\n${personaList}\n\nUse /chat <name> to start chatting with one of them.`,
      { parse_mode: 'Markdown' }
    )
  } catch (error) {
    console.error('Personas command error:', error)
    await telegramBot.sendMessage(
      chatId,
      'Sorry, I encountered an error retrieving your personas.'
    )
  }
}

async function handleChatCommand(chatId: number, telegramUser: TelegramBot.User, personaName: string) {
  try {
    if (!personaName) {
      await telegramBot.sendMessage(
        chatId,
        'Please specify a persona name. Example: /chat grandma'
      )
      return
    }

    const user = await telegramBot.findOrCreateTelegramUser(telegramUser)
    
    if (!user) {
      await telegramBot.sendMessage(
        chatId,
        'You need to create an account first. Use /start for instructions.'
      )
      return
    }

    const personas = await telegramBot.getUserPersonas(user.user_id)
    const persona = personas.find(p => 
      p.name.toLowerCase() === personaName.toLowerCase()
    )

    if (!persona) {
      await telegramBot.sendMessage(
        chatId,
        `Persona "${personaName}" not found. Use /personas to see available personas.`
      )
      return
    }

    // Create a new conversation
    const conversation = await telegramBot.createConversation(persona.id)
    
    // Set conversation state
    telegramBot.setConversationState(telegramUser.id, {
      conversationId: conversation.id,
      personId: persona.id
    })

    await telegramBot.sendMessage(
      chatId,
      `Now chatting with **${persona.name}** 💬\n\nSend any message to start the conversation. Use /stop to end.`,
      { parse_mode: 'Markdown' }
    )
  } catch (error) {
    console.error('Chat command error:', error)
    await telegramBot.sendMessage(
      chatId,
      'Sorry, I encountered an error starting the chat.'
    )
  }
}

async function handleStopCommand(chatId: number, telegramUser: TelegramBot.User) {
  const state = telegramBot.getConversationState(telegramUser.id)
  
  if (!state?.conversationId) {
    await telegramBot.sendMessage(
      chatId,
      'You\'re not currently in a chat session.'
    )
    return
  }

  telegramBot.clearConversationState(telegramUser.id)
  
  await telegramBot.sendMessage(
    chatId,
    'Chat session ended. Use /chat <persona> to start a new conversation.'
  )
}

async function handleHelpCommand(chatId: number) {
  const helpText = `
**Echo Bot Commands:**

/start - Welcome message and setup
/personas - List your available personas
/chat <name> - Start chatting with a persona
/stop - End current chat session
/help - Show this help message

**How to use:**
1. Create personas at your web dashboard
2. Use /chat <persona name> to start talking
3. Send regular messages to chat
4. Use /stop when you're done

**Example:**
\`/chat grandma\`
\`Hello, how are you today?\`
  `

  await telegramBot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' })
}

async function handleLinkCommand(chatId: number, telegramUser: TelegramBot.User, linkCode?: string) {
  try {
    const existingUser = await telegramBot.findOrCreateTelegramUser(telegramUser)
    
    if (existingUser) {
      await telegramBot.sendMessage(
        chatId,
        'Your Telegram account is already linked! Use /personas to see your available personas.'
      )
      return
    }

    if (!linkCode) {
      await telegramBot.sendMessage(
        chatId,
        'To link your account, get your 6-digit code from the web dashboard and send:\n\n`/link YOUR_CODE`\n\nExample: `/link 123456`',
        { parse_mode: 'Markdown' }
      )
      return
    }

    // Validate the link code format (6 digits)
    if (!/^\d{6}$/.test(linkCode)) {
      await telegramBot.sendMessage(
        chatId,
        'Invalid code format. Please send a 6-digit code like: `/link 123456`',
        { parse_mode: 'Markdown' }
      )
      return
    }

    // Validate and use the link code
    const linkedUser = await telegramBot.validateAndUseLinkCode(linkCode, telegramUser)
    
    // Get user's personas to show success message
    const personas = await telegramBot.getUserPersonas(linkedUser.user_id)
    
    if (personas.length > 0) {
      await telegramBot.sendMessage(
        chatId,
        `🎉 Successfully linked your account, ${telegramUser.first_name}!\n\n` +
        `You have ${personas.length} persona(s) available:\n` +
        personas.map(p => `• ${p.name} (${p.relationship})`).join('\n') + '\n\n' +
        `Use /chat <name> to start chatting!`
      )
    } else {
      await telegramBot.sendMessage(
        chatId,
        `🎉 Successfully linked your account, ${telegramUser.first_name}!\n\n` +
        `You don't have any personas yet. Visit ${process.env.APP_URL} to create your first persona!`
      )
    }
    
  } catch (error) {
    console.error('Link command error:', error)
    
    let errorMessage = 'Sorry, I encountered an error with the link command.'
    
    if (error.message.includes('Invalid or expired')) {
      errorMessage = 'Invalid or expired link code. Please get a new code from the web dashboard.'
    } else if (error.message.includes('already linked')) {
      errorMessage = 'This Telegram account is already linked to another user.'
    }
    
    await telegramBot.sendMessage(chatId, errorMessage)
  }
}

async function handleVoiceMessage(message: TelegramBot.Message, telegramUser: TelegramBot.User) {
  const chatId = message.chat.id
  
  if (!message.voice) {
    return
  }

  try {
    await telegramBot.sendMessage(
      chatId,
      'Voice messages received! 🎵\n\nFor now, please send text messages to chat with your personas. Voice input support will be added soon.'
    )
    
    // TODO: Implement voice-to-text conversion
    // 1. Download the voice file from Telegram
    // 2. Convert to text using speech-to-text API (Whisper, etc.)
    // 3. Process as regular chat message
    
  } catch (error) {
    console.error('Voice message error:', error)
    await telegramBot.sendMessage(
      chatId,
      'Sorry, I encountered an error processing your voice message.'
    )
  }
}

async function handleChatMessage(message: TelegramBot.Message, telegramUser: TelegramBot.User) {
  const chatId = message.chat.id
  const state = telegramBot.getConversationState(telegramUser.id)

  if (!state?.conversationId || !state?.personId) {
    await telegramBot.sendMessage(
      chatId,
      'Please start a chat session first using /chat <persona>. Use /personas to see available personas.'
    )
    return
  }

  if (state.awaitingResponse) {
    await telegramBot.sendMessage(
      chatId,
      'Please wait for the current response to complete.'
    )
    return
  }

  // Mark as awaiting response
  telegramBot.setConversationState(telegramUser.id, {
    ...state,
    awaitingResponse: true
  })

  try {
    // Send typing indicator
    await telegramBot.getBot()?.sendChatAction(chatId, 'typing')

    // Call the chat API to get AI response
    const response = await fetch(`${process.env.APP_URL || 'http://localhost:3000'}/api/telegram/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegramUser.id,
        conversation_id: state.conversationId,
        person_id: state.personId,
        message_content: message.text
      })
    })

    const chatResult = await response.json()

    if (!response.ok) {
      throw new Error(chatResult.error || 'Chat API failed')
    }

    // Send text response
    await telegramBot.sendMessage(chatId, chatResult.response.content)

    // Send audio if available
    if (chatResult.response.audio_url) {
      try {
        await telegramBot.getBot()?.sendChatAction(chatId, 'upload_voice')
        
        // Download the audio file and send as voice message
        const audioResponse = await fetch(chatResult.response.audio_url)
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
        
        await telegramBot.sendVoice(chatId, audioBuffer, {
          caption: '🎵 Voice message'
        })
      } catch (audioError) {
        console.error('Error sending audio:', audioError)
        // Audio sending failed, but text was sent successfully
      }
    }

    // Clear awaiting response
    telegramBot.setConversationState(telegramUser.id, {
      ...state,
      awaitingResponse: false
    })
  } catch (error) {
    console.error('Chat message error:', error)
    
    // Clear awaiting response on error
    telegramBot.setConversationState(telegramUser.id, {
      ...state,
      awaitingResponse: false
    })
    
    await telegramBot.sendMessage(
      chatId,
      'Sorry, I encountered an error processing your message. Please try again.'
    )
  }
}