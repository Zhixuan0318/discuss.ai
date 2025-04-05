'use client';

import Image from 'next/image';

import { useCallback } from 'react';

interface Props {
    poolAmount: string;
    setPoolAmount: (value: string) => void;
}

export default function PoolAmount({ poolAmount, setPoolAmount }: Props) {
    const handleAmountInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
        const regex = /([0-9]+[.]?[0-9]*)/g;
        const res = regex.exec(event.currentTarget.value);
        setPoolAmount(res?.[0] ?? '');
    }, []);

    return (
        <section className='flex flex-col items-center gap-y-6'>
            <div>Mode of winning:</div>
            <figure className='flex flex-col gap-y-3 items-center p-4 border border-foreground rounded-xl'>
                <Image src={'/images/modes/single-winner.png'} alt='singe' width={48} height={48} />
                <h5>Single Winner</h5>
                <Image src={`/images/icons/checked.svg`} alt='check' width={14} height={14} />
            </figure>
            <div className='w-1/2 relative mt-10 flex'>
                <input
                    className='w-full textarea'
                    type='text'
                    placeholder='Enter Amount'
                    value={poolAmount.toString()}
                    onInput={handleAmountInput}
                />
                <Image
                    className='absolute right-4 top-4'
                    src={`/images/icons/usdc.svg`}
                    alt='usdc'
                    width={36}
                    height={36}
                />
            </div>
        </section>
    );
}
