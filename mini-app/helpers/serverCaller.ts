type DemoType =
    | 'name'
    | 'references'
    | 'scoring'
    | 'submission'
    | 'titleAndLore'
    | 'expectationAndRules';

const ROUTE = {
    campaign: 'https://llm-campaign.vercel.app/api',
    demo: 'https://llm-quick-demo.vercel.app/api',
    agent: 'https://judge-agent.vercel.app/api',
    user: 'https://llm-user.vercel.app/api',
    submission: 'https://llm-submission.vercel.app/api',
    worldId: 'https://llm-world.vercel.app/api',
};

async function execute(path: string, method: string = 'GET', body?: {}) {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ${process.env.AUTH_KEY}');
    headers.append('Content-Type', 'application/json');

    try {
        const response = await fetch(path, {
            headers,
            method,
            body: body ? JSON.stringify(body) : undefined,
        });
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

export async function fetchCampaigns(): Promise<Campaign[]> {
    const json = await execute(`${ROUTE.campaign}/fetch-all-campaign`);
    if (json && json.success) return json.campaigns;
    return Array(4).fill(undefined);
}

export async function quickDemo(type: DemoType) {
    const json = await execute(`${ROUTE.demo}?type=${type}`);
    return json;
}

export async function fetchCampaignData(campaignId: string): Promise<CampaignInfo> {
    const json = await execute(`${ROUTE.campaign}/fetch-campaign?campaignID=${campaignId}`);
    const data = {
        campaignId: json.campaignID,
        ...json.data,
        agentId: json.data.agentID,
        walletId: json.data.walletID,
        agentID: undefined,
        walletID: undefined,
    };
    return data;
}

export async function fetchAgent(agentId: string): Promise<AgentInfo> {
    const json = await execute(
        `${ROUTE.agent}/fetch-agent?agentID=${agentId}&returnCampaignID=false`
    );
    const data = {
        ...json,
        lightLore: json.light_lore,
        scoring: json.scoring.map((item: any) => {
            return {
                criteria: item.criteria,
                description: item.criteriaDescription,
                weightage: item.weightage,
            };
        }),
        light_lore: undefined,
    };
    return data;
}

export async function isParticipantOrHost(
    walletAddress: string,
    campaignId: string
): Promise<SubmissionStatus> {
    const json = await execute(`${ROUTE.user}/check-status`, 'POST', {
        walletAddress,
        campaignID: campaignId,
    });
    return json.status;
}

export async function submit(
    campaignId: string,
    submission: string,
    wallet: string,
    blockchain: Blockchain
) {
    const json = await execute(`${ROUTE.submission}/submit-and-judge`, 'POST', {
        campaignID: campaignId,
        submissionURL: submission,
        participantWalletAddress: wallet,
        preferredBlockchain: blockchain,
    });
    return json.success;
}

export async function submitWorldId(campaignId: string, wallet: string, worldId: string) {
    const json = await execute(`${ROUTE.worldId}/submit-via-world`, 'POST', {
        campaignID: campaignId,
        participantWalletAddress: wallet,
        worldAddress: worldId,
    });
    return json.success;
}
