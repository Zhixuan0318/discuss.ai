'use client';

import Image from 'next/image';
import { useCallback } from 'react';

import { cn } from '@/lib/utils';

interface Props {
    references: string[];
    setReferences: (value: string[]) => void;
}

export default function References({ references, setReferences }: Props) {
    const handleInput = useCallback(
        (event: React.FormEvent<HTMLInputElement>, index: number) => {
            const copy = [...references];
            copy[index] = event.currentTarget.value;
            setReferences(copy);
        },
        [references]
    );

    return (
        <section className='flex flex-col gap-y-4'>
            <h4 className='mb-5'>Any references for me?</h4>
            {references.map((reference, index) => (
                <div key={index} className='w-full flex gap-x-5'>
                    <input
                        className='w-full textarea'
                        type='text'
                        value={reference}
                        onInput={(event) => handleInput(event, index)}
                    />
                    <div
                        className={cn(
                            'flex items-center gap-x-3 cursor-pointer',
                            index == references.length - 1
                                ? 'opacity-100'
                                : 'opacity-0 pointer-events-none'
                        )}
                    >
                        <Image
                            className='invert'
                            src={'/images/icons/plus.svg'}
                            alt='plus'
                            width={24}
                            height={24}
                            onClick={() => setReferences([...references, ''])}
                        />
                        <Image
                            className={index == 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                            src={'/images/icons/delete.svg'}
                            alt='delete'
                            width={24}
                            height={24}
                            onClick={() =>
                                setReferences([...references].slice(0, references.length - 1))
                            }
                        />
                    </div>
                </div>
            ))}
        </section>
    );
}
