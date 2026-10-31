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
      <body className="min-h-screen bg-[#0d0303] text-stone-100 font-sans antialiased festive-pattern">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
