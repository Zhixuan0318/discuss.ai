'use client';

import Link from 'next/link';
import NavBar from '@/components/nav-bar';
import Image from 'next/image';
import { Suspense, useCallback } from 'react';
import { TypingAnimation } from '@/components/magicui/terminal';
import CampaignModal from '@/components/ui/campaign-modal';
import SubmitModal from '@/components/submit-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { WarpBackground } from '@/components/magicui/warp-background';
import { Confetti, ConfettiRef } from '@/components/magicui/confetti';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

import {
    endDiscussion,
    fetchAgent,
    fetchCampaignData,
    isParticipantOrHost,
} from '@/service/apiCaller';

import { cn } from '@/lib/utils';
import { blockchainToExplorer, cutHex } from '@/utils';

function Submission() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { address, isConnected, isConnecting } = useAccount();

    const { toast } = useToast();
    const confettiRef = useRef<ConfettiRef>(null);

    const campaignId = useRef(searchParams.get('campaign'));
    const [campaign, setCampaign] = useState<CampaignInfo>();
    const [agent, setAgent] = useState<AgentInfo>();
    const [status, setStatus] = useState<SubmissionStatus>('PARTICIPANT');

    const [typing, setTyping] = useState(true);
    const [open, setOpen] = useState(false);
    const [modal, setModal] = useState('');

    const [isEnding, setIsEnding] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitModal, setSubmitModal] = useState(false);

    const handleSubmission = useCallback(async () => {
        if (!campaignId.current) return;

        if (status == 'ELIGIBLE-TO-SUBMIT') setSubmitModal(true);
        else {
            setIsEnding(true);
            const result = await endDiscussion(campaignId.current);
            if (result) {
                const campaignData = await fetchCampaignData(campaignId.current);
                setCampaign(campaignData);
            } else setIsEnding(false);
        }
    }, [status]);

    useEffect(() => {
        if (!isConnected && !isConnecting) router.push('/explore');
        if (campaignId.current && address)
            isParticipantOrHost(address, campaignId.current).then((data) => setStatus(data));
    }, [address, isConnected, isSubmitted]);

    useEffect(() => {
        if (!agent) return;
        setTimeout(() => setTyping(false), 3_000);
    }, [agent]);

    useEffect(() => {
        if (isSubmitted)
            toast({
                style: {
                    right: '3.5rem',
                    width: 'max-content',
                },
                title: 'Received your submission!',
                description: `Hmmmm.... it's time for me to see what you have for me`,
            });
    }, [isSubmitted]);

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

    if (!campaign || !agent || !address)
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
            <SubmitModal
                open={submitModal}
                setOpen={setSubmitModal}
                setIsSubmitted={setIsSubmitted}
                image={agent.avatar}
                campaignId={campaignId.current as string}
                userWallet={address}
                campaignBlockchain={campaign.blockchain}
            />
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
                            <TypingAnimation className='text-base' duration={25}>
                                {`Hi. My name is ${agent.name}. I think it is time to discuss `}
                            </TypingAnimation>
                            <br />
                            <TypingAnimation
                                className='font-medium text-base'
                                duration={25}
                                delay={1400}
                            >
                                {`"${campaign.name}"`}
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
                        <Link
                            className='underline'
                            href={`${blockchainToExplorer(campaign.blockchain)}/address/${
                                campaign.poolAddress
                            }`}
                            target='_blank'
                        >
                            Prize Pool
                        </Link>
                        <h4>Mode of winning</h4>
                        <h4>Submissions</h4>
                    </section>

                    {campaign.winner ? (
                        <div
                            className={cn(
                                'rounded-xl border border-quaternary duration-700',
                                typing ? 'opacity-0' : 'opacity-100'
                            )}
                        >
                            <Confetti
                                ref={confettiRef}
                                options={{ origin: { x: 0.5, y: 0.7 } }}
                                className='absolute left-0 bottom-0 z-10 size-full pointer-events-none'
                                onLoadedDataCapture={() => confettiRef.current?.fire({})}
                            />
                            <WarpBackground
                                perspective={350}
                                gridColor='var(--tetriary)'
                                className='py-6 w-full font-dm-mono rounded-xl overflow-hidden'
                            >
                                <div className='px-12 py-6 flex flex-col items-center gap-y-7 bg-background rounded-xl border border-quaternary'>
                                    <h4>The discussion concludes and we have our winner.</h4>
                                    <Link
                                        className='underline'
                                        href={`${blockchainToExplorer(
                                            campaign.blockchain
                                        )}/address/${campaign.winner.walletAddress}`}
                                        target='_blank'
                                    >
                                        {cutHex(campaign.winner.walletAddress)}
                                    </Link>
                                    <div className='flex flex-col gap-y-2 text-center'>
                                        <Link
                                            className='underline'
                                            href={campaign.winner.submissionURL}
                                            target='_blank'
                                        >
                                            Medium submission
                                        </Link>
                                        <Link
                                            className='flex items-center gap-x-1 border-b border-foreground'
                                            href={`${blockchainToExplorer(
                                                campaign.blockchain
                                            )}/tx/${campaign.winner.txHash}`}
                                            target='_blank'
                                        >
                                            {`${campaign.poolAmount}`}
                                            <Image
                                                src={'/images/icons/usdc.svg'}
                                                alt='usdc'
                                                width={16}
                                                height={16}
                                            />
                                            {`from ${campaign.blockchain} to ${campaign.winner.preferredBlockchain} in ${campaign.winner.transferExecutionDuration}`}
                                        </Link>
                                    </div>
                                </div>
                            </WarpBackground>
                        </div>
                    ) : (
                        <div className='mt-16'>
                            {isEnding ? (
                                <div className='w-full text-center'>
                                    <h4 className='mb-5 font-dm-mono'>
                                        Still running the scans, pushing limits to judge the elite.{' '}
                                        <br /> Curious to see who claims the ultimate reward...
                                    </h4>
                                    <div className='justify-self-center w-8 h-8 rounded-full border-2 border-foreground border-t-[transparent] animate-spin' />
                                </div>
                            ) : (
                                <button
                                    className={cn(
                                        'primary-button pr-24 pl-24 duration-700',
                                        typing ? 'opacity-0' : 'opacity-100'
                                    )}
                                    disabled={
                                        status == 'PARTICIPANT' ||
                                        (status == 'HOST' && campaign.submissionNumber == 0)
                                    }
                                    onClick={handleSubmission}
                                >
                                    {status == 'PARTICIPANT'
                                        ? 'Submitted'
                                        : status == 'ELIGIBLE-TO-SUBMIT'
                                        ? 'Submit'
                                        : 'End the discussion'}
                                </button>
                            )}
                        </div>
                    )}
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
