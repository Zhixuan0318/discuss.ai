'use client';

import Image from 'next/image';
import { Typography, Button, Token } from '@worldcoin/mini-apps-ui-kit-react';

import { useRouter } from 'next/navigation';

import { camelCaseToNormalText } from '@/utils';
import { cn } from '@/lib/utils';

export default function DrawerAgentCard({ campaign }: { campaign: Campaign | undefined }) {
    const router = useRouter();

    if (!campaign) return;

    return (
        <>
            <Image
                className='mb-9 border-[3px] border-background rounded-xl shadow-out'
                src={campaign.agentAvatar}
                alt='agent'
                width={286}
                height={286}
            />
            <Typography className='px-8 mb-4' variant='heading' level={3}>
                {campaign.campaignName}
            </Typography>
            <section className='w-full px-8 mb-7 flex items-center'>
                <Typography variant='body' level={3}>
                    {`Judge by ${campaign.agentName}`}
                </Typography>
                <div
                    className={cn(
                        'ml-3 p-2 pl-3 pr-3 border border-tetriary rounded-3xl text-xs',
                        campaign.agentENS ? '' : 'hidden'
                    )}
                >
                    {campaign.agentENS}
                </div>
            </section>
            <section className='w-full px-8 mb-14 flex items-center justify-between'>
                <div className='flex [&>*]:w-fit'>
                    <h5 className='secondary-selector mr-2 text-xs'>
                        {camelCaseToNormalText(campaign.mode)}
                    </h5>
                    <h5 className='secondary-selector text-xs'>
                        {campaign.isRevealed ? 'Concludes' : 'Ongoing'}
                    </h5>
                </div>
                <div className='flex items-center gap-x-1'>
                    <Typography variant='number' level={6}>
                        {campaign.poolAmount}
                    </Typography>
                    <Token value='USDC' size={28} />
                </div>
            </section>
            <Button
                onClick={() => router.push(`/submission?campaign=${campaign.campaignID}`)}
                variant='primary'
                fullWidth
                radius='lg'
            >
                Enter discussion
            </Button>
        </>
    );
}
