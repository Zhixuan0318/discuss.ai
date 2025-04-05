import { blockchains } from '@/content/blockchains';

export function cutHex(hex: string, cutLength: number = 5): string {
    return hex.slice(0, cutLength) + '...' + hex.slice(hex.length - cutLength);
}

export function camelCaseToNormalText(text: string): string {
    const upperCased = text.split('-').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`);
    return upperCased.join(' ');
}

export function selectRandomFrom(array: any[], amount: number): any[] {
    if (amount > array.length) return [];

    const randomValues = [];
    let copy = [...array];

    for (let i = 0; i < amount; i++) {
        const random = Math.floor(Math.random() * copy.length);
        randomValues.push(copy[random]);

        copy[random] = copy[copy.length - 1];
        copy.pop();
    }
    return randomValues;
}

export function chainIdToBlockchain(userChainId: number | undefined): Blockchain {
    for (let i = 0; i < blockchains.length; i++) {
        const { chainId, name } = blockchains[i];
        if (chainId == userChainId) return name as Blockchain;
    }
    return 'ETH-SEPOLIA';
}

export function chainIdToUSDCAddress(userChainId: number | undefined): string {
    for (let i = 0; i < blockchains.length; i++) {
        const { chainId, usdc } = blockchains[i];
        if (chainId == userChainId) return usdc;
    }
    return blockchains[0].usdc;
}

export function blockchainTypeToName(blockchain: Blockchain) {
    for (let i = 0; i < blockchains.length; i++) {
        const { fullName, name } = blockchains[i];
        if (name == blockchain) return fullName;
    }
    return blockchains[0].fullName;
}

export function blockchainToImg(blockchain: Blockchain) {
    for (let i = 0; i < blockchains.length; i++) {
        const { img, name } = blockchains[i];
        if (name == blockchain) return img;
    }
    return blockchains[0].img;
}

export function blockchainToExplorer(blockchain: Blockchain | undefined) {
    for (let i = 0; i < blockchains.length; i++) {
        const { explorer, name } = blockchains[i];
        if (name == blockchain) return explorer;
    }
    return blockchains[0].explorer;
}
