import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(
            `https://developer.worldcoin.org/api/v1/verify/${process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID}`,
            {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify({
                    ...body.proof,
                    action: body.action,
                }),
            }
        );

        const result = await response.json();
        return NextResponse.json({}, { status: result.success ? 200 : 400 });
    } catch (error) {
        return NextResponse.json({ error: `${error}` }, { status: 500 });
    }
}
