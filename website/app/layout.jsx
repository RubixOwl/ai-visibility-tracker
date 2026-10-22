import './globals.css';

export const metadata = {
  title: "Alpine Wave answers your phone, so you don't have to",
  description: "A phone bot and a website chat for ski, bike and tour shops. It answers from your own shop's details and gives your number and hours when it can't answer. Free demo, free 7-day trial.",
  robots: { index: true, follow: true },
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
