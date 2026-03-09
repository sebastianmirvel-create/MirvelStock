import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '../../AuthContext';
import { BottomNav } from '../../BottomNav';
import { AdminPinModal } from '../../AdminPinModal';
import { AuthGuard } from '../../AuthGuard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-100 h-screen overflow-hidden">
        <AuthProvider>
          <main className="max-w-md mx-auto h-full bg-slate-50 shadow-2xl relative flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
              <AuthGuard>
                {children}
              </AuthGuard>
            </div>
            <BottomNav />
          </main>
          <Toaster position="top-center" richColors />
          <AdminPinModal />
        </AuthProvider>
      </body>
    </html>
  );
}
