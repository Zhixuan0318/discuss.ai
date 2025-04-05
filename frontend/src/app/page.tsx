'use client';

import { Marquee } from '@/components/magicui/marquee';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import AgentCardSmall from '@/components/ui/agent-card-small';
import WalletConnector from '@/components/wallet-connector';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

import { agentCards } from '@/content/agent-cards';
import { chains } from '@/config/wagmi';

export default function Home() {
    const router = useRouter();
    const { address, isConnected, chainId } = useAccount();

    const [walletConnector, setWalletConnector] = useState(false);

    useEffect(() => {
        if (address && isConnected && chains.find((chain) => chain.id == chainId))
            router.push('/explore');
    }, [isConnected, address]);

    return (
        <main className='h-dvh flex flex-col gap-y-10 items-center justify-center text-center'>
            <WalletConnector
                walletConnector={walletConnector}
                setWalletConnector={setWalletConnector}
            />
            <h3 className='font-medium text-tetriary'>discuss.ai</h3>
            <h1 className='font-light text-6xl'>
                The Web3.0 Discussions for Humans. <br /> Led by Intelligent Agents
            </h1>
            <RainbowButton
                className='mb-10 pl-20 pr-20 pt-12 pb-12 text-2xl rounded-3xl !text-background'
                onClick={() => setWalletConnector(true)}
            >
                Join the race
            </RainbowButton>
            <div className='relative flex w-full flex-col items-center justify-center gap-y-5 overflow-hidden'>
                <Marquee pauseOnHover className='[--duration:30s]'>
                    {agentCards.slice(0, agentCards.length / 2).map((card) => (
                        <AgentCardSmall
                            key={card.name}
                            name={card.name}
                            description={card.description}
                        />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className='[--duration:30s]'>
                    {agentCards.slice(agentCards.length / 2).map((card) => (
                        <AgentCardSmall
                            key={card.name}
                            name={card.name}
                            description={card.description}
                        />
                    ))}
                </Marquee>
            </div>
        </main>
    );
}
