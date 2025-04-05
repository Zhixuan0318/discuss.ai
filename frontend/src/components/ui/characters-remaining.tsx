'use client';

import { motion, transform, useAnimate } from 'motion/react';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

interface Props {
    className?: string;
    value: string;
    setValue: (value: string) => void;
}

function CharactersRemaining({ className, value, setValue }: Props) {
    const maxLength = 55;
    const charactersRemaining = maxLength - value.length;
    const [counterRef, animate] = useAnimate();

    const mapRemainingToColor = transform([2, 6], ['#ff008c', '#ccc']);
    const mapRemainingToSpringVelocity = transform([0, 5], [50, 0]);

    useEffect(() => {
        if (charactersRemaining > 6) return;

        animate(
            counterRef.current,
            { scale: 1 },
            {
                type: 'spring',
                velocity: mapRemainingToSpringVelocity(charactersRemaining),
                stiffness: 700,
                damping: 80,
            }
        );
    }, [animate, charactersRemaining]);

    return (
        <div className={cn('container', className)}>
            <input className='w-full' value={value} onChange={(e) => setValue(e.target.value)} />
            <div>
                <motion.span
                    ref={counterRef}
                    style={{
                        color: mapRemainingToColor(charactersRemaining),
                        willChange: 'transform',
                    }}
                >
                    {charactersRemaining}
                </motion.span>
            </div>
            <Stylesheet />
        </div>
    );
}

function Stylesheet() {
    return (
        <style>
            {`
        .container, input {
          position: relative;
          font-size: 1rem;
          line-height: 1;
        }

        input {
          background-color: var(--background);
          color: var(--foreground);
          border: 1px solid var(--quaternary);
          border-radius: 24px;
          padding: 1.25rem;
		  transition: all 300ms;
        }

        input:focus {
		  transition: all 300ms;
          border-color: var(--foreground);
        }

        .container div {
          color: #ccc;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            var(--layer) 20%
          );
          position: absolute;
          top: 50%;
          right: 2px;
          transform: translateY(-50%);
          padding: 10px;
          padding-right: 20px;
          padding-left: 50px;
        }

        .container div span {
          display: block;
        }
      `}
        </style>
    );
}

export default CharactersRemaining;
