'use client';

import { useMemo } from 'react';

interface Props {
    className?: string;
    naming: string;
    value: string;
    setValue: (value: string) => void;
}

export default function ResizeInput({ className, naming, value, setValue }: Props) {
    const rows = useMemo(() => Math.max(Math.ceil(value.length / 83), 3), [value]);

    return (
        <section className={className}>
            <h4 className='mb-5'>{naming}</h4>
            <textarea
                value={value}
                className='w-full textarea'
                style={{ height: `calc(2.5rem*${rows})` }}
                rows={rows}
                name='lore'
                id='lore'
                onInput={(event) => setValue(event.currentTarget.value)}
            />
        </section>
    );
}
