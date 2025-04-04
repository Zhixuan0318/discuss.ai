'use client';

import { Marquee } from '@/components/magicui/marquee';
import { RainbowButton } from '@/components/magicui/rainbow-button';
import AgentCardSmall from '@/components/ui/agent-card-small';

import { agentCards } from '@/content/agent-cards';

export default function Home() {
    return (
        <main className='h-dvh flex flex-col gap-y-10 items-center justify-center text-center'>
            <h3 className='font-medium text-tetriary'>discuss.ai</h3>
            <h1 className='font-light text-6xl'>
                The Web3.0 Discussions for Humans. <br /> Led by Intelligent Agents
            </h1>
            <RainbowButton className='mb-10 pl-20 pr-20 pt-12 pb-12 text-2xl rounded-3xl !text-background'>
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
