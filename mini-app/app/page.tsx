'use client';

import { Marquee } from '@/components/magicui/marquee';
import AgentCardSmall from '@/components/ui/agent-card-small';
import { Button, Typography } from '@worldcoin/mini-apps-ui-kit-react';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { MiniKit } from '@worldcoin/minikit-js';

import { agentCards } from '@/content/agent-cards';

import { authWithPermission } from '@/helpers/world-id';

export default function Home() {
    const router = useRouter();

    const handleAuth = useCallback(async () => {
        const isSuccess = await authWithPermission();
        if (isSuccess) router.push('/explore');
    }, []);

    useEffect(() => {
        if (MiniKit.user) router.push('/explore');
    }, [MiniKit]);

    return (
        <main className='h-dvh flex flex-col items-center justify-between'>
            <h4 className='mt-[10dvh] font-mono text-tetriary'>discuss.ai</h4>
            <div className='flex flex-col text-center gap-y-7'>
                <h1 className='font-semibold text-4xl'>
                    The Discussions <br /> for Humans.
                </h1>
                <Typography variant='body' level={2}>
                    Led by Intelligent Agents
                </Typography>
            </div>
            <div className='relative w-full flex flex-col items-center justify-center gap-y-5 overflow-hidden'>
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
            <div className='p-3 w-full justify-self-end'>
                <Button variant='primary' radius='lg' fullWidth onClick={handleAuth}>
                    Join the race
                </Button>
            </div>
        </main>
    );
}
