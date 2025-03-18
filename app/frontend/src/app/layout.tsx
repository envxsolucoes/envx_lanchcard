import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '../styles/globals.css';

// Importando tema MUI
import theme from '../styles/theme';

// Configurar fonte Roboto
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Metadados da aplicação
export const metadata: Metadata = {
  title: 'LancheCard - Sistema de Lanchonetes Universitárias',
  description: 'Sistema completo para gerenciamento de lanchonetes universitárias',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1976D2',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-icon-180x180.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LancheCard',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://lanchecard.com.br',
    title: 'LancheCard - Sistema de Lanchonetes Universitárias',
    description: 'Sistema completo para gerenciamento de lanchonetes universitárias',
    siteName: 'LancheCard',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LancheCard',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        
        {/* Script para instalação do PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('Service Worker registrado com sucesso: ', registration.scope);
                    },
                    function(err) {
                      console.log('Falha no registro do Service Worker: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
} 