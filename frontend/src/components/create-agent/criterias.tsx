'use client';

import Image from 'next/image';

import { useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';

const emptyCriteria = {
    criteria: '',
    description: '',
    weightage: 0,
};

interface Props {
    scoring: Criteria[];
    setScoring: (value: Criteria[]) => void;
}

export default function Criterias({ scoring, setScoring }: Props) {
    const totalWeightage = useMemo(() => {
        let summ = 0;
        scoring.map(({ weightage }) => (summ += weightage));
        return summ.toString();
    }, [scoring]);

    const handleScoringEdit = useCallback(
        (event: any, key: string, criteriaIndex: number, inputIndex: number) => {
            let value: any = event.currentTarget.value;
            if (inputIndex == 2) value = Number(value);
            if (Number.isNaN(value)) value = 0;
            const copy = [...scoring];
            //@ts-ignore
            copy[criteriaIndex][key] = value;
            setScoring(copy);
        },
        [scoring]
    );

    return (
        <section>
            <div className='mb-8 flex items-center gap-x-5'>
                <h4>As a judge, I&apos;m sure that I need a scoring rubric.</h4>
                <h3 className='text-xl'>{totalWeightage} / 100%</h3>
            </div>
            <section className='flex flex-col gap-y-4'>
                {scoring.map((criteria, index) => (
                    <div className='w-full flex gap-x-5'>
                        <div className='w-full p-5 pr-8 pl-8 flex items-center gap-x-4 border border-quaternary rounded-3xl'>
                            {Object.entries(criteria).map(([key, value], idx) => (
                                <input
                                    className={cn('textarea', idx == 1 ? 'w-full' : '')}
                                    type='text'
                                    placeholder={key[0].toUpperCase() + key.slice(1)}
                                    value={value.toString()}
                                    onInput={(event) => handleScoringEdit(event, key, index, idx)}
                                />
                            ))}
                        </div>
                        <div
                            className={cn(
                                'flex items-center gap-x-3 cursor-pointer',
                                index == scoring.length - 1
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
                                onClick={() => setScoring([...scoring, emptyCriteria])}
                            />
                            <Image
                                className={
                                    index == 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                                }
                                src={'/images/icons/delete.svg'}
                                alt='delete'
                                width={24}
                                height={24}
                                onClick={() =>
                                    setScoring([...scoring].slice(0, scoring.length - 1))
                                }
                            />
                        </div>
                    </div>
                ))}
            </section>
        </section>
    );
}
