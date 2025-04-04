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
            },
            fontFamily: {
                'dm-mono': 'var(--font-dm-mono)',
                rubik: 'var(--font-rubik)',
            },
        },
    },
    plugins: [],
};
export default config;
