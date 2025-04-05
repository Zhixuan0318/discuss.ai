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
        usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    },
    {
        img: 'arbitrum',
        name: 'ARB-SEPOLIA',
        chainId: arbitrumSepolia.id,
        usdc: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    },
    {
        img: 'avax',
        name: 'AVAX-FUJI',
        chainId: avalancheFuji.id,
        usdc: '0x5425890298aed601595a70ab815c96711a31bc65',
    },
    {
        img: 'polygon',
        name: 'MATIC-AMOY',
        chainId: polygonAmoy.id,
        usdc: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
    },
    {
        img: 'uni',
        name: 'UNI-SEPOLIA',
        chainId: unichainSepolia.id,
        usdc: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
    },
];
