
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Create simple alternatives to Next.js font components
const fontClasses = {
  geistSans: 'font-sans',
  geistMono: 'font-mono',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      <div className={`${fontClasses.geistSans} ${fontClasses.geistMono} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </div>
    </div>
  );
}
