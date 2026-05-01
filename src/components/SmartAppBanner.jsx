import React, { useState, useEffect } from 'react';

const SmartAppBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isDismissed = sessionStorage.getItem('appBottomSheetDismissed');

    if (isMobile && !isDismissed) {
      // Small delay so the sheet animates in after page load
      const timer = setTimeout(() => {
        setIsVisible(true);
        requestAnimationFrame(() => setIsAnimating(true));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('appBottomSheetDismissed', 'true');
    }, 350);
  };

  const handleOpenApp = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      const playStoreUrl = encodeURIComponent("https://play.google.com/store/apps/details?id=com.jharkhand.app");
      window.location.href = `intent://open/#Intent;scheme=jharkhandupdates;package=com.jharkhand.app;S.browser_fallback_url=${playStoreUrl};end`;
    } else {
      window.location.href = "https://play.google.com/store/apps/details?id=com.jharkhand.app";
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Dark overlay */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isAnimating ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
          zIndex: 99998,
          transition: 'background-color 0.35s ease',
        }}
      />

      {/* Bottom Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          transform: isAnimating ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '20px 24px 32px',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        }}>
          {/* Drag handle */}
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#ccc',
            borderRadius: '2px',
            margin: '0 auto 20px',
          }} />

          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <img
              src="/logo.png"
              alt="Jharkhand Updates"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                objectFit: 'contain',
                marginBottom: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              }}
            />
            <h3 style={{
              margin: '0 0 4px',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a',
            }}>
              Jharkhand Updates
            </h3>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#888',
            }}>
              Get the best experience on our app
            </p>
          </div>

          {/* Option 1: Open in App */}
          <button
            onClick={handleOpenApp}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              border: '2px solid #16a34a',
              borderRadius: '14px',
              backgroundColor: '#f0fdf4',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <img
              src="/logo.png"
              alt="App"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                objectFit: 'contain',
              }}
            />
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#15803d',
              }}>
                Continue in App
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '2px',
              }}>
                Faster · Notifications · Better Experience
              </div>
            </div>
            <div style={{
              backgroundColor: '#16a34a',
              color: '#fff',
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}>
              Open
            </div>
          </button>

          {/* Option 2: Continue in Browser */}
          <button
            onClick={handleDismiss}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              border: '1px solid #e0e0e0',
              borderRadius: '14px',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Browser icon (globe SVG) */}
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#e8e8e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#444',
              }}>
                Continue in Browser
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '2px',
              }}>
                Stay on the website
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default SmartAppBanner;
