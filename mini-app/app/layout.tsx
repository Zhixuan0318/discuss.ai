import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Sora, DM_Mono, Rubik } from 'next/font/google';

import MiniKitProvider from '@/components/minikit-provider';
import NextAuthProvider from '@/components/next-auth-provider';

import './globals.css';
import '@worldcoin/mini-apps-ui-kit-react/styles.css';

export const metadata: Metadata = {
    title: 'Discuss AI',
    description: 'Discuss AI Mini App',
};

const sora = Sora({
    variable: '--font-display',
    subsets: ['latin'],
    weight: ['300', '400'],
});

const dmMono = DM_Mono({
    variable: '--font-mono',
    subsets: ['latin'],
    weight: ['400', '500'],
});

const rubik = Rubik({
    variable: '--font-sans',
    subsets: ['latin'],
    weight: ['300'],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const ErudaProvider = dynamic(
        () => import('../components/Eruda').then((c) => c.ErudaProvider),
        {
            ssr: false,
        }
    );
    return (
        <html lang='en'>
            <head>
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link rel='preconnect' href='https://fonts.gstatic.com' />
                <link
                    href='https://fonts.googleapis.com/css2?family=DM+Mono:ital@0;1&family=Rubik:ital,wght@0,300..900;1,300..900&family=Sora:wght@600&display=swap'
                    rel='stylesheet'
                />
            </head>
            <body className={`${sora.className} ${dmMono.className} ${rubik.className}`}>
                <NextAuthProvider>
                    <ErudaProvider>
                        <MiniKitProvider>{children}</MiniKitProvider>
                    </ErudaProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}
