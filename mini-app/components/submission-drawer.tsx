'use client';

import Image from 'next/image';
import {
    DrawerContent,
    Typography,
    Button,
    Input,
    Select,
} from '@worldcoin/mini-apps-ui-kit-react';

import { useState, useCallback } from 'react';

import { MiniKit } from '@worldcoin/minikit-js';
import { blockchains } from '@/content/blockchains';

import { quickDemo, submit } from '@/helpers/serverCaller';
import { sendNotification, verifySubmitAction } from '@/helpers/world-id';
import { blockchainTypeToName } from '@/utils';

export default function SubmissionDrawer({
    campaign,
    agent,
    setStatus,
}: {
    campaign: CampaignInfo;
    agent: AgentInfo;
    setStatus: (value: SubmissionStatus) => void;
}) {
    const [url, setUrl] = useState('');
    const [address, setAddress] = useState('');
    const [blockchain, setBlockchain] = useState<Blockchain>(blockchains[0].name as Blockchain);

    const [processing, setProcessing] = useState(false);

    const handleSubmit = useCallback(async () => {
        try {
            if (!url || !address || !blockchain) return;
            setProcessing(true);

            const { user, commandsAsync } = MiniKit;
            const isVerified = await verifySubmitAction();
            if (!user || !isVerified) {
                setProcessing(false);
                return;
            }

            const isSubmitted = await submit(campaign.campaignId, url, address, blockchain);
            if (!isSubmitted) {
                setProcessing(false);
                return;
            }

            await commandsAsync.sendHapticFeedback({
                hapticsType: 'notification',
                style: 'success',
            });

            await sendNotification(
                user.walletAddress,
                'Received your submission!',
                'Hmmm... it’s time to read what you have for me'
            );

            setStatus('PARTICIPANT');
        } catch (error) {
        } finally {
            setProcessing(false);
        }
    }, [campaign, url, address, blockchain]);

    return (
        <DrawerContent>
            <section className='p-6 flex flex-col gap-y-6'>
                <div className='flex items-center justify-between'>
                    <Image
                        className='rounded-xl'
                        src={agent.avatar}
                        alt='avatar'
                        width={58}
                        height={58}
                    />
                    <Button
                        variant='tertiary'
                        size='md'
                        radius='md'
                        onClick={() => quickDemo('references').then((data) => setUrl(data))}
                    >
                        Quick Demo
                    </Button>
                </div>
                <Typography variant='body' level={3}>
                    Great to see you here. Let me see what you have for this discussion.
                </Typography>
                <Input
                    value={url}
                    onInput={(event) => setUrl(event.currentTarget.value)}
                    placeholder='URL link to Medium blog'
                ></Input>
                <Typography variant='body' level={3}>
                    I’m also controlling the precious prize pool for this discussion on the{' '}
                    <span className='font-medium'>{blockchainTypeToName(campaign.blockchain)}</span>{' '}
                    blockchain. Let me know what blockchain you want to receive your reward. <br />{' '}
                    <br />
                    Who knows? Maybe you are the only winner I choose. And don’t worry, I have
                    multichain transfer ability!
                </Typography>
                <Select
                    defaultValue={blockchains[0].name}
                    options={blockchains.map((item) => {
                        return { value: item.name, label: item.fullName };
                    })}
                    onChange={(value) => setBlockchain(value as Blockchain)}
                />
                <Input
                    value={address}
                    onInput={(event) => setAddress(event.currentTarget.value)}
                    placeholder='Your EVM address'
                />
                <div className='mt-6'>
                    <Button radius='lg' fullWidth onClick={handleSubmit} isLoading={processing}>
                        Confirm my submission
                    </Button>
                </div>
            </section>
        </DrawerContent>
    );
}
