'use client';

import { DrawerContent } from '@worldcoin/mini-apps-ui-kit-react';

import { useMemo } from 'react';

interface Props {
    agent: AgentInfo;
    modal: string;
}

export default function CampaignDrawer({ agent, modal }: Props) {
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

    return (
        <DrawerContent className='flex items-center justify-center'>
            <section className='w-full p-6 flex flex-col gap-y-8 bg-background rounded-3xl'>
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
        </DrawerContent>
    );
}
