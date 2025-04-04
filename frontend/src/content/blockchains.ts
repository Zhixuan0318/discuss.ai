import {
    sepolia,
    arbitrumSepolia,
    avalancheFuji,
    polygonAmoy,
    unichainSepolia,
} from 'wagmi/chains';

export const blockchains = [
    {
        img: 'ethereum',
        name: 'ETH-SEPOLIA',
        chainId: sepolia.id,
    },
    {
        img: 'arbitrum',
        name: 'ARB-SEPOLIA',
        chainId: arbitrumSepolia.id,
    },
    {
        img: 'avax',
        name: 'AVAX-FUJI',
        chainId: avalancheFuji.id,
    },
    {
        img: 'polygon',
        name: 'MATIC-AMOY',
        chainId: polygonAmoy.id,
    },
    {
        img: 'uni',
        name: 'UNI-SEPOLIA',
        chainId: unichainSepolia.id,
    },
];
