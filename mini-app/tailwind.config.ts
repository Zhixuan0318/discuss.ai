import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
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
                'transparent-full': 'var(--transparent-full)',
                muted: 'var(--muted)',
                disabled: 'var(--text-disabled)',
                'color-1': 'hsl(var(--color-1))',
                'color-2': 'hsl(var(--color-2))',
                'color-3': 'hsl(var(--color-3))',
                'color-4': 'hsl(var(--color-4))',
                'color-5': 'hsl(var(--color-5))',
            },
            fontFamily: {
                display: 'var(--font-display)',
                mono: 'var(--font-mono)',
                sans: 'var(--font-sans)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            keyframes: {
                marquee: {
                    from: {
                        transform: 'translateX(0)',
                    },
                    to: {
                        transform: 'translateX(calc(-100% - var(--gap)))',
                    },
                },
                'marquee-vertical': {
                    from: {
                        transform: 'translateY(0)',
                    },
                    to: {
                        transform: 'translateY(calc(-100% - var(--gap)))',
                    },
                },
            },
            animation: {
                marquee: 'marquee var(--duration) infinite linear',
                'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
            },
        },
    },
    plugins: [],
};
export default config;
