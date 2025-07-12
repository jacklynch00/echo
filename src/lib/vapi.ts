interface CallRequest {
	assistantId: string;
	phoneNumberId: string;
	customer: {
		number: string;
		numberE164CheckEnabled?: boolean;
	};
	assistant?: {
		voice?: {
			provider: '11labs';
			voiceId: string;
			model?: 'eleven_turbo_v2_5';
			stability?: number;
			similarityBoost?: number;
		};
		variableValues?: {
			[key: string]: string | number | boolean;
		};
	};
}

export async function createVapiCall(apiKey: string, request: CallRequest): Promise<unknown> {
	const response = await fetch('https://api.vapi.ai/call/phone', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`VAPI API error! status: ${response.status}, message: ${errorText}`);
	}

	return await response.json();
}

interface PersonInfo {
	name: string;
	relationship: string;
	callerName?: string;
}

export function createCallRequest(
	phoneNumber: string,
	voiceId: string,
	personInfo: PersonInfo,
	assistantId: string = '294980b2-5092-46a1-9a50-5063bde9ef2e',
	phoneNumberId: string = '838e891b-c899-49f2-b268-5ca2f2e30d4f'
): CallRequest {
	return {
		assistantId,
		phoneNumberId,
		customer: {
			number: phoneNumber,
			numberE164CheckEnabled: true,
		},
		assistant: {
			voice: {
				provider: '11labs',
				voiceId,
				model: 'eleven_turbo_v2_5',
				stability: 0.5,
				similarityBoost: 0.75,
			},
			variableValues: {
				personName: personInfo.name,
				relationship: personInfo.relationship,
				callerName: personInfo.callerName || 'my dear',
				phoneNumber: phoneNumber,
			},
		},
	};
}
