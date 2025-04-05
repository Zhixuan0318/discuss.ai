type DemoType =
    | 'name'
    | 'references'
    | 'scoring'
    | 'submission'
    | 'titleAndLore'
    | 'expectationAndRules';

const ROUTE = {
    circle: 'https://llm-circle.vercel.app/api',
    campaign: 'https://llm-campaign.vercel.app/api',
    demo: 'https://llm-quick-demo.vercel.app/api',
    agent: 'https://judge-agent.vercel.app/api',
    avatar: 'https://llm-avatar.vercel.app/api',
    embed: 'https://llm-embedder.vercel.app/api',
    ens: 'https://llm-ens.vercel.app/api',
    user: 'https://llm-user.vercel.app/api',
    submission: 'https://llm-submission.vercel.app/api',
    ranking: 'https://ranking-task.vercel.app/api',
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

export async function createPool(blockchain: Blockchain, poolAmount: string) {
    const json = await execute(`${ROUTE.circle}/create-wallet`, 'POST', { blockchain, poolAmount });
    if (json.success) return json;
}

export async function poolFundingStatus(walletId: string) {
    const json = await execute(`${ROUTE.circle}/check-pool-status?walletID=${walletId}`);
    return json.success;
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

export async function endDiscussion(campaignId: string) {
    const json = await execute(`${ROUTE.ranking}/`, 'POST', {
        campaignID: campaignId,
    });
    console.log(json);
    return json.success;
}

export async function createAgent(campaign: CampaignCreation) {
    const json = await execute(`${ROUTE.agent}/create-agent`, 'POST', {
        expectation: campaign.expectation,
        light_lore: campaign.lightLore,
        name: campaign.name,
        references: campaign.references,
        rules: campaign.rules,
        scoring: campaign.scoring.map((item) => {
            return {
                criteria: item.criteria,
                criteriaDescription: item.description,
                weightage: item.weightage,
            };
        }),
    });
    return json.agentID;
}

export async function createCampaign(
    title: string,
    agentId: string,
    hostWallet: string,
    walletId: string
) {
    const json = await execute(`${ROUTE.campaign}/create-campaign`, 'POST', {
        name: title,
        agentID: agentId,
        hostWalletAddress: hostWallet,
        walletID: walletId,
    });
    return json;
}

export async function generateAvatar(agentId: string) {
    const json = await execute(`${ROUTE.avatar}/`, 'POST', {
        agentID: agentId,
    });
    return json.url;
}

export async function performEmbedding(agentId: string) {
    const json = await execute(`${ROUTE.embed}/embed`, 'POST', { agentID: agentId });
    return json;
}

export async function createEns(name: string, agentId: string) {
    const json = await execute(`${ROUTE.ens}/create-ens`, 'POST', {
        name,
        agentID: agentId,
    });
    return json.subdomain;
}
