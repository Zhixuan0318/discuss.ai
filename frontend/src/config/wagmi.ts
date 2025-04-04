import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    sepolia,
    arbitrumSepolia,
    avalancheFuji,
    polygonAmoy,
    unichainSepolia,
} from 'wagmi/chains';

export const chains = [sepolia, arbitrumSepolia, avalancheFuji, polygonAmoy, unichainSepolia];

export const config = getDefaultConfig({
    appName: 'DiscussAI',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
    chains: chains as any,
    ssr: true,
});
