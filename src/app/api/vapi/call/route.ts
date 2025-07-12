import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/src/lib/auth';
import { createServerActionClient } from '@/src/lib/supabase-server';
import { createVapiCall, createCallRequest } from '@/src/lib/vapi';

export async function POST(request: NextRequest) {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { personId, phoneNumber } = await request.json();

		if (!personId || !phoneNumber) {
			return NextResponse.json(
				{
					error: 'Person ID and phone number are required',
				},
				{ status: 400 }
			);
		}

		// Validate phone number format (basic E.164 check)
		const phoneRegex = /^\+[1-9]\d{1,14}$/;
		if (!phoneRegex.test(phoneNumber)) {
			return NextResponse.json(
				{
					error: 'Phone number must be in E.164 format (e.g., +1234567890)',
				},
				{ status: 400 }
			);
		}

		const supabase = await createServerActionClient();

		// Get person details and verify ownership
		const { data: person, error: personError } = await supabase.from('persons').select('id, name, relationship, voice_id').eq('id', personId).eq('user_id', user.id).single();

		if (personError || !person) {
			return NextResponse.json({ error: 'Person not found' }, { status: 404 });
		}

		if (!person.voice_id) {
			return NextResponse.json(
				{
					error: 'Person does not have a voice ID configured',
				},
				{ status: 400 }
			);
		}

		// Create VAPI call request with person information
		const personInfo = {
			name: person.name,
			relationship: person.relationship,
			callerName: user.user_metadata?.full_name || user.email?.split('@')[0] || "my dear"
		};
		
		const callRequest = createCallRequest(phoneNumber, person.voice_id, personInfo);

		// Make the call
		const apiKey = process.env.VAPI_API_KEY;
		if (!apiKey) {
			return NextResponse.json(
				{
					error: 'VAPI API key not configured',
				},
				{ status: 500 }
			);
		}

		const callResult = await createVapiCall(apiKey, callRequest);

		return NextResponse.json({
			success: true,
			call: callResult,
			person: {
				id: person.id,
				name: person.name,
			},
		});
	} catch (error) {
		console.error('VAPI call error:', error);
		return NextResponse.json(
			{
				error: 'Failed to initiate call',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
