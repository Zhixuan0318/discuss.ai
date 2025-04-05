'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import {
    Button,
    Drawer,
    DrawerTrigger,
    DrawerClose,
    Token,
    Typography,
} from '@worldcoin/mini-apps-ui-kit-react';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { WarpBackground } from '@/components/magicui/warp-background';
import { Confetti, type ConfettiRef } from '@/components/magicui/confetti';
import { Skeleton } from '@/components/ui/skeleton';
import CampaignDrawer from '@/components/ui/campaign-drawer';
import SubmissionDrawer from '@/components/submission-drawer';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, useEffect, useCallback } from 'react';

import { MiniKit } from '@worldcoin/minikit-js';

import { fetchAgent, fetchCampaignData } from '@/helpers/serverCaller';

import { blockchainToExplorer, cutHex } from '@/utils';
import { cn } from '@/lib/utils';

function Submission() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const campaignId = useRef(searchParams.get('campaign'));

    const [campaign, setCampaign] = useState<CampaignInfo>();
    const [agent, setAgent] = useState<AgentInfo>();

    const [modal, setModal] = useState('');
    const [typing, setTyping] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const confettiRef = useRef<ConfettiRef>(null);
    const drawerClose = useRef<HTMLButtonElement>(null);

    const handleLink = useCallback((link: string) => router.push(link), []);

    useEffect(() => {
        if (!MiniKit.user) router.push('/');
    }, []);

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
    }, [isSubmitted]);

    useEffect(() => {
        if (isSubmitted) drawerClose.current?.click();
    }, [isSubmitted]);

    useEffect(() => {
        if (!agent) return;
        setTimeout(() => setTyping(false), 3_200);
    }, [agent]);

    if (!campaign || !agent)
        return (
            <section className='m-6 p-4 border border-quaternary rounded-xl translate-y-[37dvh]'>
                <Skeleton className='w-[58px] h-[58px] mb-7 rounded-xl' />
                <Skeleton className='mb-2 w-full h-4' />
                <Skeleton className='w-full h-4' />
            </section>
        );

    return (
        <main>
            <section
                className={cn(
                    'h-dvh p-6 flex flex-col [&>*]:duration-1000',
                    typing ? '[&>*]:opacity-0 [&>*]:pointer-events-none' : '[&>*]:opacity-100'
                )}
            >
                <Image
                    className='mb-8'
                    src={'/images/back-button.png'}
                    alt='back'
                    width={32}
                    height={32}
                    onClick={() => router.push('/explore')}
                />
                <section
                    className={cn(
                        'p-4 border border-quaternary rounded-xl bg-background !duration-700 !opacity-100',
                        typing ? 'translate-y-[30dvh]' : 'translate-y-0'
                    )}
                >
                    <Image
                        className='mb-7 rounded-xl'
                        src={agent.avatar}
                        alt='avatar'
                        width={58}
                        height={58}
                    />
                    <div className='flex font-mono'>
                        <TypingAnimation className='text-sm font-normal' duration={25}>
                            {`Hi. My name is ${agent.name}. I think it is time to discuss "${campaign.name}"`}
                        </TypingAnimation>
                    </div>
                </section>
                <section className={'my-3 w-full grid grid-cols-3 gap-x-3'}>
                    <Drawer>
                        {['Expectations', 'Rules', 'Rubric'].map((item) => (
                            <DrawerTrigger key={item}>
                                <div
                                    className='px-3 py-7 flex flex-col items-center gap-y-3 cursor-pointer border border-quaternary rounded-xl'
                                    onClick={() => setModal(item.toLowerCase())}
                                >
                                    <Typography variant='body' level={3}>
                                        {item}
                                    </Typography>
                                    <Image
                                        src={'/icons/open-arrow.svg'}
                                        alt='arrow'
                                        width={20}
                                        height={20}
                                    />
                                </div>
                            </DrawerTrigger>
                        ))}
                        <CampaignDrawer agent={agent} modal={modal} />
                    </Drawer>
                </section>
                <section
                    className={cn(
                        'w-full p-6 grid grid-cols-3 gap-y-5 items-center justify-items-center border border-quaternary rounded-xl',
                        campaign.winner ? 'mb-3' : 'mb-auto'
                    )}
                >
                    <div className='flex items-center gap-x-2'>
                        <Typography variant='number' level={3}>
                            {campaign.poolAmount}
                        </Typography>
                        <Token value='USDC' size={28} />
                    </div>
                    <Image
                        src={`/images/modes/${campaign.mode}.png`}
                        alt='mode'
                        width={46}
                        height={46}
                    />
                    <Typography variant='number' level={3}>
                        {campaign.submissionNumber}
                    </Typography>
                    <Typography
                        className='underline'
                        variant='body'
                        level={3}
                        onClick={() =>
                            handleLink(
                                `${blockchainToExplorer(campaign.blockchain)}/address/${
                                    campaign.poolAddress
                                }`
                            )
                        }
                    >
                        Prize Pool
                    </Typography>
                    <Typography variant='body' level={3}>
                        Mode
                    </Typography>
                    <Typography variant='body' level={3}>
                        Submissions
                    </Typography>
                </section>
                {campaign.winner ? (
                    <div className={'rounded-xl border border-quaternary duration-700'}>
                        <Confetti
                            ref={confettiRef}
                            options={{ origin: { x: 0.5, y: 0.7 } }}
                            className='absolute left-0 bottom-0 z-10 size-full pointer-events-none'
                            onLoadedDataCapture={() => confettiRef.current?.fire({})}
                        />
                        <WarpBackground
                            perspective={200}
                            gridColor='var(--tetriary)'
                            className='py-3 px-1 w-full flex items-center justify-center rounded-xl overflow-hidden'
                        >
                            <div className='px-4 py-6 flex flex-col items-center gap-y-4 bg-background rounded-xl border border-quaternary'>
                                <Image
                                    className='absolute right-2 top-2'
                                    src={'/images/worldcoin.png'}
                                    alt='worldcoin'
                                    width={18}
                                    height={18}
                                />
                                <Typography className='font-mono' level={1}>
                                    Discussion concludes!
                                </Typography>
                                <Typography
                                    className='font-mono underline'
                                    level={2}
                                    onClick={() =>
                                        handleLink((campaign.winner as any).submissionURL)
                                    }
                                >
                                    Medium submission
                                </Typography>
                                <Typography
                                    className='flex flex-wrap gap-x-1 font-mono border-b border-foreground'
                                    level={2}
                                    onClick={() =>
                                        handleLink(
                                            `${blockchainToExplorer(
                                                (campaign.winner as any).preferredBlockchain
                                            )}/tx/${(campaign.winner as any).txHash}`
                                        )
                                    }
                                >
                                    {`${campaign.poolAmount}`}
                                    <Token value='USDC' size={16} />
                                    {`sent to ${cutHex(campaign.winner.walletAddress)}`}
                                </Typography>
                            </div>
                        </WarpBackground>
                    </div>
                ) : (
                    <Drawer>
                        <DrawerTrigger>
                            <Button variant='primary' fullWidth disabled={isSubmitted}>
                                Submit
                            </Button>
                        </DrawerTrigger>
                        <SubmissionDrawer
                            campaign={campaign}
                            agent={agent}
                            setIsSubmitted={setIsSubmitted}
                        />
                        <DrawerClose ref={drawerClose} />
                    </Drawer>
                )}
            </section>
        </main>
    );
}

export default function Suspended() {
    return (
        <Suspense>
            <Submission />
        </Suspense>
    );
}
