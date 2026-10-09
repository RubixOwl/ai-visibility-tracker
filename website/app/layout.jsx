import './globals.css';

export const metadata = {
  title: 'Alpine Wave — 24/7 Front-Desk Voice & Web Assistants for Seasonal Businesses',
  description: 'Alpine Wave builds 24/7 voice and website front-desk assistants for seasonal businesses. We shield your staff from peak phone rushes, capture after-hours inquiries, and pull verified answers directly from your approved data.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return (
    <html lang="en-CA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Nunito:wght@800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
