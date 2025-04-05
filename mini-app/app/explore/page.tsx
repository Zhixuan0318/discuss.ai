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
import { useRouter } from 'next/navigation';

import { MiniKit } from '@worldcoin/minikit-js';

import { fetchCampaigns } from '@/helpers/serverCaller';

export default function Explore() {
    const router = useRouter();

    const [campaigns, setCampaigns] = useState<Campaign[] | undefined[]>(Array(6).fill(undefined));
    const [selectedCampaign, setSelectedCampgain] = useState<Campaign>();

    useEffect(() => {
        const { isInstalled, user } = MiniKit;
        if (!isInstalled() || !user) {
            router.push('/');
            return;
        }
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
                    {campaigns.map((campgaing) => {
                        return campgaing ? (
                            <DrawerTrigger
                                className='w-full border-[3px] border-background rounded-3xl shadow-xl overflow-hidden'
                                onClick={() => setSelectedCampgain(campgaing)}
                            >
                                <Image
                                    src={campgaing.agentAvatar}
                                    alt='agent'
                                    width={156}
                                    height={156}
                                />
                            </DrawerTrigger>
                        ) : (
                            <Skeleton className='w-full pt-[100%] rounded-3xl shadow-xl' />
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
