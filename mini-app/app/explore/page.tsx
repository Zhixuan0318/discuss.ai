'use client';

import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    Typography,
} from '@worldcoin/mini-apps-ui-kit-react';
import Image from 'next/image';
import DrawerAgentCard from '@/components/ui/drawer-agent-card';
import { Skeleton } from '@/components/ui/skeleton';

import { useEffect, useState } from 'react';

import { fetchCampaigns } from '@/helpers/serverCaller';

export default function Explore() {
    const [campaigns, setCampaigns] = useState<Campaign[] | undefined[]>(Array(6).fill(undefined));
    const [selectedCampaign, setSelectedCampgain] = useState<Campaign>();

    useEffect(() => {
        fetchCampaigns().then((data) => setCampaigns(data));
    }, []);

    return (
        <main className='p-12'>
            <Typography className='pb-3' variant='heading' level={1}>
                Explore
            </Typography>
            <Typography className='font-sans pb-7' variant='body' level={3}>
                The most interesting discussion led by agents.
            </Typography>
            <Drawer>
                <section className='relative grid grid-cols-2 gap-4'>
                    {campaigns.map((campaign, index) => {
                        return campaign ? (
                            <DrawerTrigger
                                key={campaign.campaignID}
                                className='w-full border-[3px] border-background rounded-3xl shadow-out overflow-hidden'
                                onClick={() => setSelectedCampgain(campaign)}
                            >
                                <Image
                                    src={campaign.agentAvatar}
                                    alt='agent'
                                    width={156}
                                    height={156}
                                />
                            </DrawerTrigger>
                        ) : (
                            <Skeleton
                                key={index}
                                className='w-full pt-[100%] rounded-3xl shadow-out'
                            />
                        );
                    })}
                </section>
                <DrawerContent className='px-6 py-3 flex flex-col items-center'>
                    <DrawerAgentCard campaign={selectedCampaign} />
                </DrawerContent>
            </Drawer>
        </main>
    );
}
