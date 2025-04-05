'use client';

import Link from 'next/link';
import Image from 'next/image';
import HostAgent from './host-agent';

import { useState } from 'react';
import { useAccountModal } from '@rainbow-me/rainbowkit';

export default function NavBar({ hostButton }: { hostButton?: boolean }) {
    const { openAccountModal } = useAccountModal();
    const [openHost, setOpenHost] = useState(false);

    return (
        <nav className='p-5 flex items-center justify-between border-b border-quaternary'>
            {hostButton && <HostAgent openModal={openHost} setOpenModal={setOpenHost} />}
            <Link href={'/explore'} className='font-dm-mono text-xl font-medium cursor-pointer'>
                discuss.ai
            </Link>
            <section className='flex items-center gap-x-3'>
                <Image
                    src={'/images/ai-logo.png'}
                    alt='ai-logo'
                    width={48}
                    height={48}
                    className='cursor-pointer'
                    onClick={() => (openAccountModal ? openAccountModal() : {})}
                />
                {hostButton && (
                    <button className='primary-button' onClick={() => setOpenHost(true)}>
                        <Image src={'/images/icons/plus.svg'} alt='plus' width={12} height={12} />
                        Host
                    </button>
                )}
            </section>
        </nav>
    );
}
