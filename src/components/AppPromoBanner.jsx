import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

const AppPromoBanner = () => {
  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    fetch('/GooglePlayButton.json')
      .then(res => res.json())
      .then(data => setLottieData(data))
      .catch(() => {});
  }, []);

  const handleGetApp = () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      const playStoreUrl = encodeURIComponent("https://play.google.com/store/apps/details?id=com.jharkhand.app");
      window.location.href = `intent://open/#Intent;scheme=jharkhandupdates;package=com.jharkhand.app;S.browser_fallback_url=${playStoreUrl};end`;
    } else {
      window.location.href = "https://play.google.com/store/apps/details?id=com.jharkhand.app";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onClick={handleGetApp}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        padding: '14px 16px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* Subtle green accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        {/* App Icon */}
        <img
          src="/logo.png"
          alt="Jharkhand Updates"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            objectFit: 'contain',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        />

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '2px',
          }}>
            <h4 style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: '700',
              color: '#1a1a1a',
              letterSpacing: '-0.2px',
              whiteSpace: 'nowrap',
            }}>
              Jharkhand Updates
            </h4>
            {/* Verified badge */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            {/* Stars */}
            <div style={{ display: 'flex', gap: '1px' }}>
              {[1,2,3,4].map(i => (
                <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#facc15">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#d1d5db">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>4.5</span>
            <span style={{ fontSize: '9px', color: '#d1d5db' }}>•</span>
            <span style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap' }}>News App</span>
          </div>
        </div>

        {/* CTA / Lottie */}
        <div style={{ flexShrink: 0 }}>
          {lottieData ? (
            <Lottie
              animationData={lottieData}
              loop={true}
              style={{ width: '140px', height: '42px' }}
            />
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
            }}>
              Get App
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AppPromoBanner;
