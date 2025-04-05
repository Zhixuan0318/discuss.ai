'use client';

import Image from 'next/image';
import { CopyButton } from '@lobehub/ui';
import NavBar from '@/components/nav-bar';

import { useRouter } from 'next/navigation';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';

import { CampaignContext } from '@/context/CampaignProvider';

import { poolFundingStatus } from '@/service/apiCaller';

import { config } from '@/config/wagmi';
import { parseUnits } from 'viem';
import { chainIdToUSDCAddress } from '@/utils';

const ABI = [
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];

export default function FundPool() {
    const { chainId } = useAccount({ config });
    const { writeContract, status } = useWriteContract({ config });

    const router = useRouter();
    const { campaign } = useContext(CampaignContext);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!campaign.poolAddress || !campaign.walletId) router.push('/explore');
    }, [campaign]);

    const [tries, setTries] = useState(0);
    useEffect(() => {
        if (tries == 6) {
            setIsProcessing(false);
            return;
        }
        if (status == 'success')
            try {
                poolFundingStatus(campaign.walletId).then(async (isFunded) => {
                    if (isFunded) router.push('/create-agent/generate');
                    await new Promise((resolve) => setTimeout(resolve, 10_000));
                    setTries(tries + 1);
                });
            } catch {
                setTries(tries + 1);
            }
        if (status == 'error') setIsProcessing(false);
    }, [status, tries]);

    const handleProcessing = useCallback(() => {
        setTries(0);
        setIsProcessing(true);
        writeContract({
            address: chainIdToUSDCAddress(chainId) as any,
            abi: ABI,
            functionName: 'transfer',
            chainId,
            args: [campaign.poolAddress, parseUnits(campaign.poolAmount, 6)],
        });
    }, [campaign, chainId]);

    return (
        <>
            <NavBar />
            <main className='flex items-center justify-center'>
                <div className='mt-28 flex flex-col items-center justify-center gap-y-16'>
                    <h1 className='text-4xl'>Fund {campaign.name}&apos;s Pool</h1>
                    <section className='flex items-center gap-x-5'>
                        <h1 className='font-dm-mono text-8xl'>{campaign.poolAmount}</h1>
                        <Image src={'/images/icons/usdc.svg'} alt='usdc' width={64} height={64} />
                    </section>
                    <div className='flex items-center gap-x-10 textarea'>
                        <h4 className='font-dm-mono'>{campaign.poolAddress}</h4>
                        <CopyButton content={campaign.poolAddress} />
                    </div>
                    {!isProcessing ? (
                        <button className='w-2/5 primary-button' onClick={handleProcessing}>
                            Fund Now
                        </button>
                    ) : (
                        <div className='w-16 h-16 rounded-full border-[0.3rem] border-foreground border-t-[transparent] animate-spin'></div>
                    )}
                </div>
            </main>
        </>
    );
}
