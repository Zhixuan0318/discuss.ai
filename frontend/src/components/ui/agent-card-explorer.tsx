'use client';

import Image from 'next/image';
import { ShineBorder } from '../magicui/shine-border';
import { Skeleton } from './skeleton';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { camelCaseToNormalText } from '@/utils';

export default function AgentCardExplorer({ campaign }: { campaign: Campaign | undefined }) {
    if (!campaign)
        return (
            <figure className='relative w-[600px] p-3 flex gap-x-7 border border-quaternary hover:border-background transition-all duration-300 rounded-3xl cursor-pointer'>
                <Skeleton className='min-w-[182px] min-h-[182px]' />
                <section className='w-full flex flex-col justify-between'>
                    <section>
                        <Skeleton className='h-[3rem] mt-5 mb-5' />
                        <Skeleton className='h-[1.5rem] w-full' />
                    </section>
                    <section className='flex items-center justify-between'>
                        <div className='w-1/2 flex items-center'>
                            <Skeleton className='mr-2 h-[1.5rem] w-1/2 rounded-lg' />
                            <Skeleton className='h-[1.5rem] w-1/2 rounded-lg' />
                        </div>
                        <Skeleton className='h-[1.5rem] w-1/4' />
                    </section>
                </section>
            </figure>
        );

    const router = useRouter();
    const [isHover, setIsHover] = useState(false);

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            const clickedOn = event.target as HTMLElement;

            if (clickedOn.id == 'campaignENS')
                router.push(`https://app.ens.domains/${campaign.agentENS}`);
            else router.push(`/submission?campaign=${campaign.campaignID}`);
        },
        [campaign]
    );

    return (
        <figure
            onClick={handleClick}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
            className='relative min-w-fit w-[600px] p-3 flex gap-x-7 border border-quaternary hover:border-background transition-all duration-300 rounded-3xl cursor-pointer'
        >
            {isHover && <ShineBorder />}
            <Image
                className='min-w-[182px] min-h-[182px] rounded-3xl'
                src={campaign.agentAvatar}
                alt='avatar'
                width={182}
                height={182}
            />
            <section className='w-full flex flex-col justify-between'>
                <section>
                    <h3 className='mt-5 mb-3 text-xl'>{campaign.campaignName}</h3>
                    <div className='flex items-center'>
                        <h5 className='font-rubik font-light text-sm'>
                            Judge by {campaign.agentName}
                        </h5>
                        {campaign.agentENS && (
                            <div
                                id='campaignENS'
                                className='ml-3 p-2 pl-3 pr-3 border border-tetriary rounded-3xl text-xs'
                            >
                                {campaign.agentENS}
                            </div>
                        )}
                    </div>
                </section>
                <section className='flex items-center justify-between [&_h5]:p-2 [&_h5]:pl-4 [&_h5]:pr-4 [&_h5]:font-rubik [&_h5]:text-xs [&_h5]:rounded-lg'>
                    <div className='grid grid-cols-2 items-center text-center'>
                        <h5 className='secondary-selector mr-2'>
                            {camelCaseToNormalText(campaign.mode)}
                        </h5>
                        <h5 className='secondary-selector'>
                            {campaign.isRevealed ? 'Concludes' : 'Ongoing'}
                        </h5>
                    </div>
                    <div className='flex items-center gap-x-2'>
                        <h3 className='text-xl'>{campaign.poolAmount}</h3>
                        <Image src={'/images/icons/usdc.svg'} alt='usdc' width={24} height={24} />
                    </div>
                </section>
            </section>
        </figure>
    );
}
