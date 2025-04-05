import { blockchains } from '@/content/blockchains';

export function camelCaseToNormalText(text: string): string {
    const upperCased = text.split('-').map((word) => `${word[0].toUpperCase()}${word.slice(1)}`);
    return upperCased.join(' ');
}

export function cutHex(hex: string, cutLength: number = 5): string {
    return hex.slice(0, cutLength) + '...' + hex.slice(hex.length - cutLength);
}

export function blockchainToExplorer(blockchain: Blockchain | undefined) {
    for (let i = 0; i < blockchains.length; i++) {
        const { explorer, name } = blockchains[i];
        if (name == blockchain) return explorer;
    }
    return blockchains[0].explorer;
}

export function blockchainTypeToName(blockchain: Blockchain) {
    for (let i = 0; i < blockchains.length; i++) {
        const { fullName, name } = blockchains[i];
        if (name == blockchain) return fullName;
    }
    return blockchains[0].fullName;
}
