import React from 'react';
import { useEffect, useState } from 'react';

interface MobileOptimizedProps {
  children: React.ReactNode;
}

export function MobileOptimized({ children }: MobileOptimizedProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check if PWA is installed
    const checkInstalled = () => {
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    };

    checkMobile();
    checkInstalled();

    window.addEventListener('resize', checkMobile);
    
    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
      }
      
      setDeferredPrompt(null);
    }
  };

  return (
    <div className={`mobile-optimized ${isMobile ? 'mobile-view' : 'desktop-view'}`}>
      {/* PWA Install Banner */}
      {isMobile && !isInstalled && deferredPrompt && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">📱 Instala Mercenary como app</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallPWA}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium"
              >
                Instalar
              </button>
              <button
                onClick={() => setDeferredPrompt(null)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-specific optimizations */}
      {isMobile && (
        <style jsx>{`
          .mobile-view {
            /* Touch-friendly tap targets */
            --tap-target-size: 44px;
          }
          
          .mobile-view button,
          .mobile-view a,
          .mobile-view input {
            min-height: var(--tap-target-size);
            min-width: var(--tap-target-size);
          }
          
          /* Prevent zoom on input focus */
          .mobile-view input,
          .mobile-view select,
          .mobile-view textarea {
            font-size: 16px;
          }
          
          /* Smooth scrolling */
          .mobile-view {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          /* Hide scrollbars on mobile */
          .mobile-view::-webkit-scrollbar {
            display: none;
          }
          
          /* Safe area insets for notched devices */
          .mobile-view {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        `}</style>
      )}

      {children}
    </div>
  );
}

// Hook for mobile detection
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Hook for PWA detection
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if running as PWA
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    }
  };

  return {
    isInstalled,
    isInstallable,
    installPWA
  };
}
