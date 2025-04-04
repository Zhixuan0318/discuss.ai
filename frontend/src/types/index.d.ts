import { Address } from 'viem';

export {};

declare global {
    type Blockchain = 'ETH-SEPOLIA' | 'ARB-SEPOLIA' | 'AVAX-FUJI' | 'MATIC-AMOY' | 'UNI-SEPOLIA';
    type Mode = 'single-winner';

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
}
