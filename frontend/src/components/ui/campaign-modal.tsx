'use client';

import Image from 'next/image';

import { useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';

interface Props {
    agent: AgentInfo;
    modal: string;
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function CampaignModal({ agent, modal, open, setOpen }: Props) {
    const title = useMemo(() => {
        if (modal == 'expectations') return 'My expectations for this discussion.';
        if (modal == 'rules') return 'Follow the rules of this discussion.';
        return 'How I judge in this discussion.';
    }, [agent, modal]);

    const text = useMemo(() => {
        if (modal == 'expectations') return agent.expectation;
        if (modal == 'rules') return agent.rules;
        return '';
    }, [agent, modal]);

    const handleCloseModal = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const targetId = (event.target as any).id;
        if (targetId == 'background') setOpen(false);
    }, []);

    return (
        <div
            onClick={handleCloseModal}
            id='background'
            className={cn(
                'fixed top-0 left-0 z-10 w-dvw h-dvh flex items-center justify-center bg-transparent duration-700 ease-in-out',
                open ? 'translate-y-0' : 'translate-y-[100dvh]'
            )}
        >
            <section className='w-3/5 p-9 flex flex-col gap-y-8 bg-background rounded-3xl'>
                <Image
                    className='rounded-xl'
                    src={agent.avatar}
                    alt='avatar'
                    width={86}
                    height={86}
                />
                <h3 className='text-2xl'>{title}</h3>
                {modal != 'rubric' ? (
                    <h4 className='font-light'>{text}</h4>
                ) : (
                    <ol className='font-light'>
                        {agent.scoring.map((item) => (
                            <li key={item.criteria}>
                                {`${item.criteria}: ${item.description} ${item.weightage}%`}
                            </li>
                        ))}
                    </ol>
                )}
            </section>
        </div>
    );
}
