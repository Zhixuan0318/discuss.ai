import type { Metadata } from 'next';
import { Sora, DM_Mono, Rubik } from 'next/font/google';

import WalletProvider from '@/context/WalletProvider';
import { ModalProvider } from '@/components/ui/animated-modal';
import { CampaignProvider } from '@/context/CampaignProvider';
import { Toaster } from '@/components/ui/toaster';

import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';

export const metadata: Metadata = {
    title: 'Discuss AI',
    description: 'Discuss AI App',
};

const sora = Sora({
    variable: '--font-sora',
    subsets: ['latin'],
    weight: ['300', '400'],
});

const dmMono = DM_Mono({
    variable: '--font-dm-mono',
    subsets: ['latin'],
    weight: ['400', '500'],
});

const rubik = Rubik({
    variable: '--font-rubik',
    subsets: ['latin'],
    weight: ['300'],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body className={`${sora.variable} ${dmMono.variable} ${rubik.variable} antialiased`}>
                <ModalProvider>
                    <WalletProvider>
                        <CampaignProvider>
                            {children}
                            <Toaster />
                        </CampaignProvider>
                    </WalletProvider>
                </ModalProvider>
            </body>
        </html>
    );
}
