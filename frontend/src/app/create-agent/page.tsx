'use client';

import Image from 'next/image';
import NavBar from '@/components/nav-bar';
import CharactersRemaining from '@/components/ui/characters-remaining';
import ResizeInput from '@/components/ui/resize-input';
import Criterias from '@/components/create-agent/criterias';
import References from '@/components/create-agent/references';
import PoolAmount from '@/components/create-agent/pool-amount';

import { CampaignContext } from '@/context/CampaignProvider';

import { useCallback, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

import { quickDemo, createPool } from '@/service/apiCaller';

import { cn } from '@/lib/utils';
import { chainIdToBlockchain } from '@/utils';

export default function CreateAgent() {
    const router = useRouter();

    const { address, chainId } = useAccount();
    const { campaign, dispatch } = useContext(CampaignContext);

    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!campaign.name) router.push('/explore');
        if (campaign.poolAddress && campaign.walletId) router.push('/create-agent/fund-pool');
    }, [campaign]);

    useEffect(() => {
        if (page < 6 || campaign.walletId) return;
        createPool(chainIdToBlockchain(chainId), campaign.poolAmount)
            .then((data) =>
                dispatch({
                    poolAddress: data.walletAddress,
                    walletId: data.walletID,
                    blockchain: data.blockchain,
                    owner: address as any,
                })
            )
            .catch(() => setPage(5));
    }, [campaign, page]);

    const handleQuickDemo = useCallback(async () => {
        if (page == 1) {
            const res = await quickDemo('titleAndLore');
            dispatch({ title: res.campaignName, lightLore: res.light_lore });
        } else if (page == 2) {
            const res = await quickDemo('expectationAndRules');
            dispatch({ expectation: res.expectations, rules: res.rules });
        } else if (page == 3) {
            const res = await quickDemo('scoring');
            dispatch({
                scoring: res.map((item: any) => {
                    return {
                        criteria: item.criteria,
                        description: item.criteriaDescription,
                        weightage: item.weightage,
                    };
                }),
            });
        } else if (page == 4) {
            const res = await quickDemo('references');
            dispatch({ references: [res] });
        }
    }, [page]);

    const handleNextPage = useCallback(() => {
        const next = () => setPage(page + 1);
        switch (page) {
            case 1: {
                if (
                    campaign.title.length &&
                    campaign.title.length <= 55 &&
                    campaign.lightLore.length
                )
                    next();
            }
            case 2: {
                if (campaign.expectation.length && campaign.rules.length) next();
            }
            case 3: {
                let skip = false;
                let summ = 0;
                for (let i = 0; i < campaign.scoring.length; i++) {
                    summ += campaign.scoring[i].weightage;
                    skip =
                        (skip && !campaign.scoring[i].criteria) || !campaign.scoring[i].description;
                }
                if (!skip && Number(summ) == 100) next();
            }
            case 4: {
                for (let i = 0; i < campaign.references.length; i++) {
                    if (!campaign.references[i]) return;
                }
                next();
            }
            case 5: {
                if (Number(campaign.poolAmount) > 0) next();
            }
        }
    }, [campaign, page]);

    return (
        <>
            <NavBar />
            <main className='mt-24 flex justify-center overflow-hidden'>
                <div
                    className={cn(
                        'relative w-3/5 flex flex-col gap-y-11 text-left [&>*]:w-full',
                        page == 3 ? 'w-4/5' : ''
                    )}
                >
                    <div className='mb-6 flex gap-x-6 items-center'>
                        <h1
                            className={cn(
                                'text-4xl transition-all duration-500',
                                page >= 5 ? 'text-center' : 'text-left'
                            )}
                        >
                            Hey, I&apos;m {campaign.name}.
                        </h1>
                        <button
                            className='p-4 flex items-center gap-x-2 border border-quaternary rounded-xl'
                            onClick={handleQuickDemo}
                        >
                            <Image
                                src={'/images/icons/quick-demo.svg'}
                                alt='demo'
                                width={24}
                                height={24}
                            />
                            Quick Demo
                        </button>
                    </div>
                    {page == 1 && (
                        <>
                            <section>
                                <h4 className='mb-5'>What’s the discussion title?</h4>
                                <CharactersRemaining
                                    value={campaign.title}
                                    setValue={(title) => dispatch({ title })}
                                />
                            </section>
                            <ResizeInput
                                naming='Can I know more about myself?'
                                value={campaign.lightLore}
                                setValue={(lightLore) => dispatch({ lightLore })}
                            />
                        </>
                    )}
                    {page == 2 && (
                        <>
                            <ResizeInput
                                naming='What’s my expectations for the discussion?'
                                value={campaign.expectation}
                                setValue={(expectation) => dispatch({ expectation })}
                            />
                            <ResizeInput
                                naming='Any rules for the human?'
                                value={campaign.rules}
                                setValue={(rules) => dispatch({ rules })}
                            />
                        </>
                    )}
                    {page == 3 && (
                        <Criterias
                            scoring={campaign.scoring}
                            setScoring={(scoring) => dispatch({ scoring })}
                        />
                    )}
                    {page == 4 && (
                        <References
                            references={campaign.references}
                            setReferences={(references) => dispatch({ references })}
                        />
                    )}
                    {page >= 5 && (
                        <PoolAmount
                            poolAmount={campaign.poolAmount}
                            setPoolAmount={(poolAmount) => dispatch({ poolAmount })}
                        />
                    )}
                    <section className='flex items-center justify-center gap-x-5 mt-6'>
                        <button
                            className={cn(
                                'secondary-button self-center',
                                page > 1 && page <= 5 ? 'block' : 'hidden'
                            )}
                            onClick={() => setPage(page - 1)}
                        >
                            <Image
                                className='rotate-180'
                                src={'/images/icons/arrow-right.svg'}
                                alt='arrow'
                                width={24}
                                height={24}
                            />
                        </button>
                        <button
                            className={cn(
                                'h-full self-center',
                                page < 5 ? 'secondary-button' : 'primary-button',
                                page == 6 ? 'hidden' : 'block'
                            )}
                            onClick={handleNextPage}
                        >
                            {page < 5 ? (
                                <Image
                                    src={'/images/icons/arrow-right.svg'}
                                    alt='arrow'
                                    width={24}
                                    height={24}
                                />
                            ) : (
                                `Create a pool for ${campaign.name}`
                            )}
                        </button>
                        {page == 6 && (
                            <div className='w-16 h-16 rounded-full border-[0.3rem] border-foreground border-t-[transparent] animate-spin'></div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
