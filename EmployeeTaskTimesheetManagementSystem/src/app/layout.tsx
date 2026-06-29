import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';

export const metadata: Metadata = {
  title: 'TaskFlow | Employee Task & Timesheet Management',
  description: 'Enterprise Employee Task and Timesheet Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <AuthProvider>
            <AppProvider>
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
