import {
    ISuccessResult,
    MiniKit,
    Permission,
    VerificationLevel,
    VerifyCommandInput,
} from '@worldcoin/minikit-js';

export async function authWithPermission(): Promise<boolean> {
    const { isInstalled, commandsAsync } = MiniKit;
    if (!isInstalled()) throw new Error('MiniKit is not installed');

    const res = await fetch(`/api/nonce`);
    const { nonce } = await res.json();

    const { finalPayload } = await commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement: 'Authentication for Discuss AI',
    });

    if (finalPayload.status === 'error') throw new Error('User is not authed');

    const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            payload: finalPayload,
            nonce,
        }),
    });

    const { status } = await response.json();
    if (status == 'error') throw new Error('Complete Siwe is not successfull');

    await MiniKit.commandsAsync.requestPermission({
        permission: Permission.Notifications,
    });

    return true;
}

export async function verifySubmitAction(): Promise<boolean> {
    const { isInstalled, user, commandsAsync } = MiniKit;
    if (!isInstalled() || !user) return false;

    const verifyPayload: VerifyCommandInput = {
        action: 'submit',
        verification_level: VerificationLevel.Device,
    };

    const { finalPayload } = await commandsAsync.verify(verifyPayload);
    if (finalPayload.status === 'error') return false;

    const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            payload: finalPayload as ISuccessResult,
            action: 'submit',
        }),
    });

    const verifyResponseJson = await verifyResponse.json();
    if (verifyResponseJson.status != 200) return false;

    return true;
}

export async function sendNotification(
    walletAddress: string,
    title: string,
    message: string
): Promise<boolean> {
    const appId = process.env.APP_ID;

    try {
        const response = await fetch(
            'https://developer.worldcoin.org/api/v2/minikit/send-notification',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.DEV_PORTAL_API_KEY}`,
                },
                body: JSON.stringify({
                    app_id: appId,
                    wallet_addresses: [walletAddress],
                    title,
                    message,
                    mini_app_path: `worldapp://mini-app?app_id=${appId}`,
                }),
            }
        );

        const json = await response.json();
        return json.success;
    } catch (error) {
        return false;
    }
}