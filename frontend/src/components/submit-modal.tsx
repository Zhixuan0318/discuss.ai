'use client';

import Image from 'next/image';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { IDKitWidget, ISuccessResult, useIDKit, VerificationLevel } from '@worldcoin/idkit';

import { useCallback, useState } from 'react';

import { quickDemo, submit } from '@/service/apiCaller';

import { blockchains } from '@/content/blockchains';

import { cn } from '@/lib/utils';
import { blockchainToImg, blockchainTypeToName } from '@/utils';

interface Props {
    open: boolean;
    setOpen: (value: boolean) => void;
    setIsSubmitted: (value: boolean) => void;
    image: string;
    campaignId: string;
    userWallet: string;
    campaignBlockchain: Blockchain;
}

export default function SubmitModal({
    open,
    setOpen,
    setIsSubmitted,
    image,
    campaignId,
    userWallet,
    campaignBlockchain,
}: Props) {
    const idKit = useIDKit();

    const [processing, setProcessing] = useState(false);
    const [submission, setSubmission] = useState('');
    const [blockchain, setBlockchain] = useState<Blockchain>(campaignBlockchain);

    const handleCloseModal = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const targetId = (event.target as any).id;
        if (targetId == 'background') setOpen(false);
    }, []);

    const handleQuickDemo = useCallback(async () => {
        setSubmission(await quickDemo('references'));
    }, []);

    const handleSubmission = useCallback(async () => {
        setProcessing(true);
        const success = await submit(campaignId, submission, userWallet, blockchain);
        if (success) {
            setIsSubmitted(true);
            setOpen(false);
        }
    }, [campaignId, submission, userWallet, blockchain]);

    return (
        <div
            onClick={handleCloseModal}
            id='background'
            className={cn(
                'fixed top-0 left-0 z-10 w-dvw h-dvh flex items-center justify-center bg-transparent duration-700 ease-in-out',
                open ? 'translate-y-0' : 'translate-y-[100dvh]'
            )}
        >
            <IDKitWidget
                app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as any}
                action={'submit'}
                onSuccess={(_result) => handleSubmission()}
                handleVerify={async (result: ISuccessResult) => {
                    const response = await fetch('/api/worldcoin', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ proof: result, action: 'submit' }),
                    });

                    if (response.status == 500) throw new Error('Server error');
                    if (response.status == 400) throw new Error('Verification error');
                }}
                verification_level={VerificationLevel.Device}
            />
            <section className='w-3/5 p-9 flex flex-col gap-y-3 bg-background rounded-3xl'>
                <Image className='rounded-xl' src={image} alt='avatar' width={86} height={86} />
                <div className='flex justify-between items-center'>
                    <h4>Great to see you here. Let me see what you have for this discussion.</h4>
                    <button
                        className='p-4 flex items-center gap-x-2 border border-quaternary rounded-xl text-xs'
                        onClick={handleQuickDemo}
                    >
                        <Image
                            src={'/images/icons/quick-demo.svg'}
                            alt='demo'
                            width={20}
                            height={20}
                        />
                        Quick Demo
                    </button>
                </div>
                <div className='p-3 flex items-center gap-x-4 textarea'>
                    <Image src={'/images/medium.png'} alt='medium' width={48} height={48} />
                    <input
                        className='w-full'
                        value={submission}
                        onInput={(event) => setSubmission(event.currentTarget.value)}
                        type='text'
                        placeholder='Enter the full URL link to your Medium blog post'
                    />
                </div>
                <div className='mt-9 mb-9'>
                    <p className='mb-5'>
                        I&apos;m also controlling the precious prize pool for this discussion on the{' '}
                        <span className='font-semibold'>
                            {blockchainTypeToName(campaignBlockchain)}
                        </span>{' '}
                        blockchain. Let me know what blockchain you want to receive your reward.{' '}
                        <br /> <br /> Who knows? Maybe you are the only winner I choose. <br /> And
                        don’t worry, I have multichain transfer ability!
                    </p>
                    <Select
                        value={blockchain}
                        onValueChange={(value) => setBlockchain(value as any)}
                    >
                        <SelectTrigger className='p-4 w-full h-fit bg-background border border-quaternary rounded-xl'>
                            <SelectValue placeholder='Select a blockchain'>
                                <div className='flex items-center gap-x-4'>
                                    <Image
                                        src={`/images/blockchain/${blockchainToImg(
                                            blockchain
                                        )}.png`}
                                        alt='blockchain'
                                        width={40}
                                        height={40}
                                    />
                                    <h4>{blockchainTypeToName(blockchain)}</h4>
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className='mt-2 flex flex-col gap-y-6 bg-background border border-quaternary rounded-xl'>
                            {blockchains.map((item) => (
                                <SelectItem
                                    key={item.name}
                                    className='flex pl-4 items-center gap-x-4 cursor-pointer'
                                    value={item.name}
                                >
                                    <div className='flex items-center gap-x-4'>
                                        <Image
                                            src={`/images/blockchain/${item.img}.png`}
                                            alt='blockchain'
                                            width={40}
                                            height={40}
                                        />
                                        {item.fullName}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {processing ? (
                    <div className='self-center w-8 h-8 rounded-full border-2 border-foreground border-t-[transparent] animate-spin' />
                ) : (
                    <div className='w-full flex flex-col items-center gap-y-5'>
                        <button
                            className='w-full primary-button'
                            disabled={!submission}
                            onClick={() => idKit.setOpen(true)}
                        >
                            Confirm my submission
                        </button>
                        <div className='flex items-center gap-x-2 text-sm text-disabled'>
                            <Image
                                src={'/images/icons/info.svg'}
                                alt='info'
                                width={18}
                                height={18}
                            />
                            Get ready to verify yourself with World ID—only humans allowed.
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
