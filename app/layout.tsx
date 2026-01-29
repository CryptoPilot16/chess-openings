import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Chess Opening Trainer | Master Chess Openings with Spaced Repetition',
  description: 'Interactive chess opening trainer with 10 popular openings, spaced repetition system, gamification, and progress tracking. Learn and master chess openings through practice.',
  keywords: ['chess', 'openings', 'training', 'spaced repetition', 'learning', 'Italian Game', 'Sicilian Defense'],
  authors: [{ name: 'Chess Trainer Team' }],
  openGraph: {
    title: 'Chess Opening Trainer',
    description: 'Master chess openings through interactive practice with spaced repetition',
    url: 'https://cryptopilot16.github.io/chess-openings/',
    siteName: 'Chess Opening Trainer',
    images: [{
      url: 'https://cryptopilot16.github.io/chess-openings/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Chess Opening Trainer',
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chess Opening Trainer',
    description: 'Master chess openings with interactive practice and spaced repetition',
    images: ['https://cryptopilot16.github.io/chess-openings/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  icons: {
    icon: '♟️',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <ThemeProvider>
          <Navigation />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
