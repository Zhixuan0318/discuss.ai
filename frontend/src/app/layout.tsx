import type { Metadata } from 'next';
import { Sora, DM_Mono, Rubik } from 'next/font/google';

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
    weight: ['500'],
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
                {children}
            </body>
        </html>
    );
}
