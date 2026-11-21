import './globals.css';

export const metadata = {
  title: 'CivicOS – Smart City Monitoring & Complaint Management',
  description:
    'Building better cities through citizen participation, intelligent monitoring and transparent government services.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
