import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/src/lib/auth'
import { createServerActionClient } from '@/src/lib/supabase-server'

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Supabase session
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerActionClient()

    // Check if user already has an active (unused, non-expired) code
    const { data: existingCode, error: findError } = await supabase
      .from('telegram_link_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingCode && !findError) {
      // Return existing valid code
      return NextResponse.json({
        code: existingCode.code,
        expires_at: existingCode.expires_at
      })
    }

    // Generate new 6-digit code
    let code = generateSixDigitCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure code is unique (very unlikely to conflict, but just in case)
    while (attempts < maxAttempts) {
      const { data: conflictCode } = await supabase
        .from('telegram_link_codes')
        .select('code')
        .eq('code', code)
        .single()

      if (!conflictCode) {
        break // Code is unique
      }

      code = generateSixDigitCode()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Failed to generate unique code' },
        { status: 500 }
      )
    }

    // Set expiry to 10 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Clear any existing codes for this user first
    await supabase
      .from('telegram_link_codes')
      .delete()
      .eq('user_id', user.id)

    // Insert new code
    const { data: newCode, error: insertError } = await supabase
      .from('telegram_link_codes')
      .insert({
        code,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating link code:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      code: newCode.code,
      expires_at: newCode.expires_at
    })

  } catch (error) {
    console.error('Generate code error:', error)
    return NextResponse.json(
      { error: 'Failed to generate code' },
      { status: 500 }
    )
  }
}