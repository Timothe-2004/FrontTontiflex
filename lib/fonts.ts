import { Archivo } from 'next/font/google'
import localFont from 'next/font/local'

// Police Google Fonts - Archivo
export const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Police locale - Chillax
export const chillax = localFont({
  src: [
    {
      path: '../public/fonts/Chillax-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Chillax-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Chillax-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Chillax-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-chillax',
  display: 'swap',
})