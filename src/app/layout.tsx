import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GrandStay | Hotel Booking Analytics & ML Cancellation Predictor',
  description: 'Enterprise AI-Powered Hotel Booking Analytics, Cancellation Risk Prediction, and Reservation Ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

