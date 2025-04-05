'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatedSpan, Terminal, TypingAnimation } from '@/components/magicui/terminal';

import { useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CampaignContext } from '@/context/CampaignProvider';

import { messages, finish, ensDomain } from '@/content/terminal';

import { cn } from '@/lib/utils';
import {
    createAgent,
    createCampaign,
    createEns,
    generateAvatar,
    performEmbedding,
} from '@/service/apiCaller';

export default function Generate() {
    const router = useRouter();

    const { campaign } = useContext(CampaignContext);
    const [campgaignId, setCampaignId] = useState('');
    const initialized = useRef(false);

    const [image, setImage] = useState<string>();
    const [success, setSuccess] = useState(false);
    const [subdomain, setSubdomain] = useState('');

    useEffect(() => {
        if (!campaign.poolAddress || !campaign.walletId) router.push('/explore');

        const initializeAgent = async () => {
            if (initialized.current) return;

            const agentId = await createAgent(campaign);
            initialized.current = true;
            setCampaignId(agentId);

            const campaignJson = await createCampaign(
                campaign.title,
                agentId,
                campaign.owner,
                campaign.walletId
            );
            setCampaignId(campaignJson.campaignID);

            const avatar = await generateAvatar(agentId);
            setImage(avatar);

            await performEmbedding(agentId);

            if (campaign.blockchain === 'ETH-SEPOLIA') {
                const domain = await createEns(campaign.name, agentId);
                setSubdomain(domain);
            }

            setSuccess(true);
        };

        initializeAgent();
    }, []);

    return (
        <main className='h-dvh w-dvw flex flex-col items-center justify-center'>
            <h3 className='mb-24 font-dm-mono'>discuss.ai</h3>
            <section className='flex items-center justify-center w-full h-3/5'>
                <Terminal
                    className={cn(
                        'w-3/4 transform-all duration-500',
                        image ? '-translate-x-1/3 w-1/2' : ''
                    )}
                >
                    <TypingAnimation>{`Creating ${campaign.name}`}</TypingAnimation>
                    {messages.map((message, index) => (
                        <AnimatedSpan
                            key={index}
                            delay={(index + 1) * 750}
                            className='text-green-500'
                        >
                            <span>✔ {message}</span>
                        </AnimatedSpan>
                    ))}
                    {image && (
                        <TypingAnimation delay={150} className='text-blue-500'>
                            {`𝐢 ${campaign.name} uploaded one file - coolImage.jpg`}
                        </TypingAnimation>
                    )}
                    {subdomain && (
                        <TypingAnimation delay={150} className='text-blue-500'>
                            {`𝐢 ${ensDomain}`}
                        </TypingAnimation>
                    )}
                    {success && (
                        <TypingAnimation delay={750} className='text-muted'>
                            {finish(campaign.name)}
                        </TypingAnimation>
                    )}
                </Terminal>
                {image && (
                    <div className='absolute top-[16rem] animate-appear'>
                        <h4 className='mb-3 font-dm-mono text-center'>coolImage.jpg</h4>
                        <Image
                            className='p-3 shadow-lg rounded-3xl'
                            src={image}
                            alt='avatar'
                            width={364}
                            height={364}
                        />
                        <div
                            className={cn(
                                'mt-3 subdomain duration-700',
                                subdomain ? 'opacity-100' : 'hidden opacity-0'
                            )}
                        >
                            <Image src={'/images/ens.png'} alt='ens' width={24} height={28} />
                            <Link
                                href={`https://sepolia.app.ens.domains/${subdomain}`}
                                target='_blank'
                                className='text-xl font-semibold text-white'
                            >
                                {subdomain}
                            </Link>
                        </div>
                    </div>
                )}
            </section>
            <div className='mt-10 flex flex-col items-center gap-y-3'>
                {success ? (
                    <button
                        className='primary-button'
                        onClick={() => router.push(`/submission?campaign=${campgaignId}`)}
                    >
                        Continue
                    </button>
                ) : (
                    <>
                        <h5 className='font-dm-mono text-xs'>
                            {!image
                                ? 'Working hard to get myself ready...'
                                : 'Trust me, it’s almost there...'}
                        </h5>
                        <div className='w-8 h-8 rounded-full border-2 border-foreground border-t-[transparent] animate-spin'></div>
                    </>
                )}
            </div>
        </main>
    );
}
