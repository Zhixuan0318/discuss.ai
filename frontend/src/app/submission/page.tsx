'use client';

import NavBar from '@/components/nav-bar';
import Image from 'next/image';
import { Suspense } from 'react';
import { TypingAnimation } from '@/components/magicui/terminal';
import CampaignModal from '@/components/ui/campaign-modal';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

import { fetchAgent, fetchCampaignData, isParticipantOrHost } from '@/service/apiCaller';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function Submission() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { address, isConnected, isConnecting } = useAccount();

    const campaignId = useRef(searchParams.get('campaign'));
    const [campaign, setCampaign] = useState<CampaignInfo>();
    const [agent, setAgent] = useState<AgentInfo>();
    const [status, setStatus] = useState<SubmissionStatus>('PARTICIPANT');

    const [typing, setTyping] = useState(true);
    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState('');

    useEffect(() => {
        if (!isConnected && !isConnecting) router.push('/explore');
        if (campaignId.current && address) {
            isParticipantOrHost(address, campaignId.current).then((data) => setStatus(data));
        }
    }, [address, isConnected]);

    useEffect(() => {
        if (!agent) return;
        setTimeout(() => setTyping(false), 3_000);
    }, [agent]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (campaignId.current == null) {
                router.push('/explore');
                return;
            }

            const campaignData = await fetchCampaignData(campaignId.current);
            const agentData = await fetchAgent(campaignData.agentId);

            setCampaign(campaignData);
            setAgent(agentData);
        };

        fetchAllData();
    }, []);

    if (!campaign || !agent)
        return (
            <>
                <NavBar />
                <section className='w-[600px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-x-7 textarea rounded-xl'>
                    <Skeleton className='min-w-[86px] min-h-[86px]' />
                    <div className='w-full flex flex-col gap-y-3'>
                        <Skeleton className='h-6' />
                        <Skeleton className='h-6' />
                    </div>
                </section>
            </>
        );

    return (
        <>
            <NavBar />
            <CampaignModal agent={agent} modal={modal} open={open} setOpen={setOpen} />
            <main className='flex justify-center'>
                <div className='mt-14 flex flex-col items-center justify-center gap-y-4'>
                    <section
                        className={cn(
                            'w-fit flex items-center justify-center gap-x-7 textarea rounded-xl duration-700 bg-background',
                            typing ? 'translate-y-64' : 'translate-y-0'
                        )}
                    >
                        <Image
                            className='rounded-xl'
                            src={agent.avatar}
                            alt='avatar'
                            width={86}
                            height={86}
                        />
                        <div className='font-dm-mono text-center'>
                            <h4> Hi. My name is {agent.name}. I think it is time to discuss</h4>
                            <TypingAnimation className='font-medium text-base' duration={50}>
                                {campaign.name}
                            </TypingAnimation>
                        </div>
                    </section>
                    <section
                        className={cn(
                            'mt-3 w-full grid grid-cols-3 gap-x-3 duration-700',
                            typing ? 'opacity-0' : 'opacity-100'
                        )}
                    >
                        {['Expectations', 'Rules', 'Rubric'].map((item) => (
                            <div
                                key={item}
                                className='rounded-xl flex flex-col items-center gap-y-3 cursor-pointer textarea'
                                onClick={() => {
                                    setModal(item.toLowerCase());
                                    setOpen(true);
                                }}
                            >
                                <h4>{item}</h4>
                                <Image
                                    src={'/images/icons/open-arrow.svg'}
                                    alt='arrow'
                                    width={20}
                                    height={20}
                                />
                            </div>
                        ))}
                    </section>
                    <section
                        className={cn(
                            'w-full grid grid-cols-3 gap-y-5 items-center justify-items-center textarea rounded-xl duration-700',
                            typing ? 'opacity-0' : 'opacity-100'
                        )}
                    >
                        <div className='flex items-center gap-x-2'>
                            <h1 className='font-dm-mono text-5xl'>{campaign.poolAmount}</h1>
                            <Image
                                src={'/images/icons/usdc.svg'}
                                alt='usdc'
                                width={36}
                                height={36}
                            />
                        </div>
                        <Image
                            src={`/images/modes/${campaign.mode}.png`}
                            alt='mode'
                            width={47}
                            height={47}
                        />
                        <h1 className='font-dm-mono text-5xl'>{campaign.submissionNumber}</h1>
                        <h4>Prize Pool</h4>
                        <h4>Mode of winning</h4>
                        <h4>Submissions</h4>
                    </section>
                    <button
                        className={cn(
                            'mt-16 primary-button pr-24 pl-24 duration-700',
                            typing ? 'opacity-0' : 'opacity-100'
                        )}
                        disabled={status == 'PARTICIPANT'}
                    >
                        {status == 'PARTICIPANT'
                            ? 'Submitted'
                            : status == 'ELIGIBLE-TO-SUBMIT'
                            ? 'Submit'
                            : 'End the discussion'}
                    </button>
                </div>
            </main>
        </>
    );
}

export default function Suspended() {
    return (
        <Suspense>
            <Submission />
        </Suspense>
    );
}
