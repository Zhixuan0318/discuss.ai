import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                secondary: 'var(--secondary)',
                tetriary: 'var(--tetriary)',
                quaternary: 'var(--quaternary)',
                transparent: 'var(--transparent)',
                muted: 'var(--muted)',
                'color-1': 'hsl(var(--color-1))',
                'color-2': 'hsl(var(--color-2))',
                'color-3': 'hsl(var(--color-3))',
                'color-4': 'hsl(var(--color-4))',
                'color-5': 'hsl(var(--color-5))',
            },
            fontSize: {
                xs: '0.75rem',
            },
            fontFamily: {
                'dm-mono': 'var(--font-dm-mono)',
                rubik: 'var(--font-rubik)',
            },
            animation: {
                rainbow: 'rainbow var(--speed, 2s) infinite linear',
                marquee: 'marquee var(--duration) linear infinite',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
                shine: 'shine var(--duration) infinite linear',
                appear: 'appear 500ms ease-in-out forwards',
            },
            keyframes: {
                appear: {
                    from: {
                        transform: 'translateX(100%)',
                        opacity: '0',
                    },
                    to: {
                        transform: 'translateX(75%)',
                        opacity: '100',
                    },
                },
                rainbow: {
                    '0%': {
                        'background-position': '0%',
                    },
                    '100%': {
                        'background-position': '200%',
                    },
                },
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(calc(-100% - var(--gap)))' },
                },
                'marquee-vertical': {
                    from: { transform: 'translateY(0)' },
                    to: { transform: 'translateY(calc(-100% - var(--gap)))' },
                },
                shine: {
                    '0%': {
                        'background-position': '0% 0%',
                    },
                    '50%': {
                        'background-position': '100% 100%',
                    },
                    to: {
                        'background-position': '0% 0%',
                    },
                },
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};
export default config;
