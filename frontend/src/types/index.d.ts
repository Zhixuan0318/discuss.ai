import { Address } from 'viem';

export {};

declare global {
    type Blockchain = 'ETH-SEPOLIA' | 'ARB-SEPOLIA' | 'AVAX-FUJI' | 'MATIC-AMOY' | 'UNI-SEPOLIA';
    type Mode = 'single-winner';
    type SubmissionStatus = 'HOST' | 'PARTICIPANT' | 'ELIGIBLE-TO-SUBMIT';

    interface Campaign {
        campaignID: string;
        agentID: string;
        agentName: string;
        campaignName: string;
        agentENS: string | null;
        agentAvatar: string;
        mode: Mode;
        isRevealed: boolean;
        poolAmount: string;
    }

    interface CampaignInfo {
        agentId: string;
        blockchain: Blockchain;
        campaignId: string;
        hostWalletAddress: string;
        isRanking: boolean;
        isRevealed: boolean;
        mode: Mode;
        name: string;
        poolAddress: string;
        poolAmount: number;
        submissionNumber: number;
        timestamp: string;
        walletId: string;
    }

    interface AgentInfo {
        avatar: string;
        expectation: string;
        lightLore: string;
        name: string;
        references: string[];
        rules: string;
        scoring: Criteria[];
    }

    interface Action {
        [key: string]: any;
    }

    interface Criteria {
        criteria: string;
        description: string;
        weightage: number;
    }

    interface CampaignCreation {
        name: string;
        title: string;
        lightLore: string;
        expectation: string;
        rules: string;
        scoring: Criteria[];
        references: string[];
        poolAmount: string;
        poolAddress: string;
        walletId: string;
        owner: string;
        blockchain: Blockchain;
    }
}
