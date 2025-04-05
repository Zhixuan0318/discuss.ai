import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { wallet_addresses, title, message } = await req.json();

    const response = await fetch(
        'https://developer.worldcoin.org/api/v2/minikit/send-notification',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
            },
            body: JSON.stringify({
                app_id: process.env.APP_ID,
                wallet_addresses,
                title,
                message,
                mini_app_path: `worldapp://mini-app?app_id=${process.env.APP_ID}`,
            }),
        }
    );

    const json = await response.json();

    if (json.success) return NextResponse.json({ status: 200 });

    return NextResponse.json({ status: 500 });
}
