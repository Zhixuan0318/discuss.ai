'use client';

import { motion } from 'motion/react';

import Image from 'next/image';
import Link from 'next/link';
import { PlaceholdersAndVanishInput } from './ui/placeholders-and-vanish-input';
import { ModalContent } from './ui/animated-modal';

import { CampaignContext } from '@/context/CampaignProvider';

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useModal } from './ui/animated-modal';

import { randomNames } from '@/content/random-names';
import { agentCards } from '@/content/agent-cards';

import { cn } from '@/lib/utils';
import { selectRandomFrom } from '@/utils';

interface Props {
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HostAgent({ openModal, setOpenModal }: Props) {
    const { dispatch } = useContext(CampaignContext);
    const { setOpen } = useModal();

    const [cards, setCards] = useState(selectRandomFrom(agentCards, 8));

    const [rotation, setRotation] = useState(0);
    const [names, setNames] = useState(randomNames.slice(0, 4));

    const [name, setName] = useState('');
    const [isSubmit, setSubmit] = useState(false);

    useEffect(() => {
        if (!openModal) return;
        setCards(selectRandomFrom(agentCards, 8));
        setNames(randomNames.slice(0, 4));
        setRotation(0);
        setName('');
        setSubmit(false);
    }, [openModal]);

    useEffect(() => {
        setOpen(true);
    }, []);

    const handleRandomNames = useCallback(() => {
        setRotation(rotation + 180);
        setNames(selectRandomFrom(randomNames, 4));
    }, [rotation]);

    const handleCloseModal = useCallback((event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        const clickedOn = event.target as HTMLElement;
        if (clickedOn.id == 'background') setOpenModal(false);
    }, []);

    const imagesModal = useMemo(
        () => (
            <ModalContent>
                <div className='flex justify-center items-center'>
                    {cards.map(({ name }, idx) => (
                        <motion.div
                            key={'images' + idx}
                            style={{
                                rotate: Math.random() * 20 - 10,
                            }}
                            whileHover={{
                                scale: 1.1,
                                rotate: 0,
                                zIndex: 100,
                            }}
                            whileTap={{
                                scale: 1.1,
                                rotate: 0,
                                zIndex: 100,
                            }}
                            className='rounded-3xl -mr-4 mt-4 p-1 bg-background border border-background shadow-lg shrink-0 overflow-hidden'
                        >
                            <Image
                                src={`/images/agent/${name.replaceAll(' ', '-').toLowerCase()}.png`}
                                alt='images'
                                width='250'
                                height='250'
                                className='rounded-3xl h-20 w-20 md:h-40 md:w-40 object-cover shrink-0'
                            />
                        </motion.div>
                    ))}
                </div>
            </ModalContent>
        ),
        [cards]
    );

    return (
        <div
            id='background'
            className={cn(
                'fixed top-0 left-0 z-10 w-dvw h-dvh flex items-center justify-center bg-transparent duration-700 ease-in-out',
                openModal ? 'translate-y-0' : 'translate-y-[100dvh]'
            )}
            onClick={handleCloseModal}
        >
            <figure className='relative w-2/3 h-3/4 p-7 pt-12 pb-12 flex flex-col items-center bg-background rounded-3xl overflow-hidden'>
                <section className='text-center'>
                    <h2 className='text-3xl mb-4'>Create your own agent</h2>
                    <h4 className='font-rubik'>Every discussion starts with an agent.</h4>
                </section>
                {imagesModal}
                <PlaceholdersAndVanishInput
                    className={cn('duration-500', isSubmit ? 'opacity-0' : 'opacity-100')}
                    inputValue={name}
                    placeholders={[
                        'What is my name?',
                        'What do you want to call me?',
                        'Any ideas for my name?',
                    ]}
                    onChange={(event) => setName(event.currentTarget.value)}
                    onSubmit={() => setSubmit(true)}
                />
                <section
                    className={cn(
                        'mt-14 flex flex-col items-center gap-y-4 duration-500',
                        isSubmit ? 'opacity-0' : 'opacity-100'
                    )}
                >
                    <h4 className='font-rubik'>Maybe you can call me...</h4>
                    <div className='grid grid-cols-4 gap-x-3'>
                        {names.map((name) => (
                            <h5
                                key={name}
                                className='p-4 text-sm font-rubik border border-quaternary rounded-xl text-center cursor-pointer'
                                onClick={() => setName(name)}
                            >
                                {name}
                            </h5>
                        ))}
                    </div>
                    <Image
                        className={'cursor-pointer transition-all duration-700'}
                        style={{ rotate: `${rotation}deg` }}
                        src={'/images/icons/reload.svg'}
                        alt='reload'
                        width={20}
                        height={20}
                        onClick={handleRandomNames}
                    />
                </section>
                <section
                    className={cn(
                        'absolute bottom-24 flex flex-col items-center gap-y-16 duration-500',
                        isSubmit ? 'opacity-100' : 'opacity-0'
                    )}
                >
                    <h3 className='text-xl'>My name is {name}.</h3>
                    <Link
                        href={'/create-agent'}
                        className='secondary-button'
                        onClick={() => dispatch({ name })}
                    >
                        <Image
                            src={'/images/icons/arrow-right.svg'}
                            alt='arrow'
                            width={24}
                            height={24}
                        />
                    </Link>
                </section>
            </figure>
        </div>
    );
}
