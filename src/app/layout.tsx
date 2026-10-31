import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/languageContext';

export const metadata: Metadata = {
  title: 'Kali Puja Samiti Parora | Official Festival Website & Portal',
  description:
    'Official website and management portal of Kali Puja Samiti Parora (Purnea, Bihar). Annual Kali Puja Utsav, All-Bihar Kabaddi Tournament, Cultural Programs, and Student Achievers Felicitation.',
  keywords: [
    'Kali Puja Parora',
    'Kali Puja Samiti Parora',
    'Parora Purnea',
    'Kabaddi Tournament Parora',
    'Parora Pratibha Samman',
    'Kali Puja 2026',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=Rozha+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0d0303] text-stone-100 font-sans antialiased festive-pattern">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
