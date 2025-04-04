async function execute(path: string, method: string = 'GET', body?: JSON) {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ${process.env.AUTH_KEY}');
    headers.append('Content-Type', 'application/json');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/${path}`, {
        headers,
        method,
        body: body ? JSON.stringify(body) : undefined,
    });

    return await response.json();
}

export async function fetchCampaigns(): Promise<Campaign[]> {
    const json = await execute('fetch-all-campaign');
    if (json.success) return json.campaigns;
    return [];
}
