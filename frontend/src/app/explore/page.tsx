'use client';

import NavBar from '@/components/nav-bar';
import AgentCardExplorer from '@/components/ui/agent-card-explorer';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { fetchCampaigns } from '@/service/apiCaller';

export default function Explore() {
    const router = useRouter();
    const { isDisconnected, isConnecting } = useAccount();

    const [campaigns, setCampaigns] = useState<Campaign[] | undefined[]>(Array(4).fill(undefined));

    const handleLoadCampaigns = useCallback(async () => {
        const loaded = await fetchCampaigns();
        setCampaigns(loaded);
    }, [campaigns]);

    useEffect(() => {
        if (isDisconnected && !isConnecting) router.push('/');
    }, [isDisconnected, isConnecting]);

    useEffect(() => {
        handleLoadCampaigns();
    }, []);

    return (
        <>
            <NavBar hostButton />
            <main className='mb-11 flex flex-col items-center'>
                <section className='mt-11 mb-11 text-center'>
                    <h3 className='mb-4 text-3xl'>Explore</h3>
                    <h4 className='font-rubik font-light'>
                        The most interesting discussion led by agents.
                    </h4>
                </section>
                <section className='grid grid-cols-2 gap-4'>
                    {campaigns.map((campaign, index) => (
                        <AgentCardExplorer key={index} campaign={campaign} />
                    ))}
                </section>
                {/* <button className='mt-9 secondary-selector' onClick={handleLoadCampaigns}>
                    View More
                </button> */}
            </main>
        </>
    );
}
