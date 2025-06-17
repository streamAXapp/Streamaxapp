import { Inter } from 'next/font/google'
import './globals.css'
import { Toast } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'StreamAX - 24/7 YouTube Streaming Service',
  description: 'Professional 24/7 YouTube streaming service with Docker-based isolation and multi-user support',
  keywords: 'streaming, youtube, 24/7, docker, professional, live streaming',
  authors: [{ name: 'StreamAX Team' }],
  creator: 'StreamAX',
  publisher: 'StreamAX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://streamax.app'),
  openGraph: {
    title: 'StreamAX - 24/7 YouTube Streaming Service',
    description: 'Professional 24/7 YouTube streaming service with Docker-based isolation',
    url: 'https://streamax.app',
    siteName: 'StreamAX',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'StreamAX - Professional Streaming Service',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreamAX - 24/7 YouTube Streaming Service',
    description: 'Professional 24/7 YouTube streaming service with Docker-based isolation',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div id="root">
          {children}
        </div>
        <Toast />
      </body>
    </html>
  )
}