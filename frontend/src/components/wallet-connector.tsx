'use client';

import Image from 'next/image';
import { ShineBorder } from './magicui/shine-border';

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSwitchChain } from 'wagmi';

import { blockchains } from '@/content/blockchains';
import { config } from '@/config/wagmi';

import { cn } from '@/lib/utils';

interface Props {
    walletConnector: boolean;
    setWalletConnector: Dispatch<SetStateAction<boolean>>;
}

export default function WalletConnector({ walletConnector, setWalletConnector }: Props) {
    const { chainId, isConnected } = useAccount();
    const { switchChain } = useSwitchChain({ config });
    const { openConnectModal } = useConnectModal();

    const [chain, setChain] = useState(0);

    const handleCloseTab = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.preventDefault();
        const element = event.target as HTMLElement;
        if (element.id == 'background') setWalletConnector(false);
    }, []);

    const handleWalletConnection = useCallback(async () => {
        if (!chain || !openConnectModal) return;
        openConnectModal();
    }, [chain, openConnectModal]);

    useEffect(() => {
        if (!isConnected) return;
        if (chain != chainId) switchChain({ chainId: chain as any });
        setWalletConnector(false);
    }, [chain, chainId, isConnected]);

    return (
        <div
            id='background'
            className={cn(
                'fixed z-10 w-dvw h-dvh flex items-center justify-center bg-transparent duration-700 ease-in-out',
                walletConnector ? 'translate-y-0' : 'translate-y-[100dvh]'
            )}
            onClick={handleCloseTab}
        >
            <figure className='p-9 flex flex-col gap-y-6 bg-background rounded-3xl'>
                <h4 className='text-secondary text-left'>SUPPORTED BLOCKCHAIN</h4>
                <section className='grid grid-cols-5 gap-x-2'>
                    {blockchains.map(({ name, img, chainId }) => (
                        <div
                            key={chainId}
                            className={cn(
                                'relative p-4 pb-7 pt-7 flex flex-col gap-y-4 items-center border rounded-xl cursor-pointer duration-300 transition-all',
                                chain == chainId ? 'border-background' : 'border-quaternary',
                                chain == chainId ? 'cursor-default' : 'hover:scale-110'
                            )}
                            onClick={() => setChain(chainId)}
                        >
                            {chain == chainId && (
                                <ShineBorder
                                    borderWidth={2}
                                    shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']}
                                />
                            )}
                            <Image
                                className='w-8 h-8'
                                src={`/images/blockchain/${img}.png`}
                                alt='blockchain'
                                width={48}
                                height={48}
                            />
                            <h5 className='text-xs'>{name}</h5>
                            <Image
                                className={cn(
                                    'absolute bottom-2 transition-all duration-300',
                                    chain == chainId ? 'opacity-100' : 'opacity-0'
                                )}
                                src={`/images/icons/checked.svg`}
                                alt='check'
                                width={14}
                                height={14}
                            />
                        </div>
                    ))}
                </section>
                <button
                    className='w-full primary-button text-xl rounded-3xl'
                    onClick={handleWalletConnection}
                >
                    Connect Wallet
                </button>
            </figure>
        </div>
    );
}
