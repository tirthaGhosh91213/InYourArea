import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const SmartAppBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check if banner was previously dismissed
    const isDismissed = localStorage.getItem('appBannerDismissed');

    if (isMobile && !isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('appBannerDismissed', 'true');
  };

  const handleOpenApp = () => {
    // Determine the device type
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
      // Deep link intent for Android: tries to open app, falls back to Play Store
      const playStoreUrl = encodeURIComponent("https://play.google.com/store/apps/details?id=com.jharkhand.app");
      window.location.href = `intent://open/#Intent;scheme=https;package=com.jharkhand.app;S.browser_fallback_url=${playStoreUrl};end`;
    } else {
      // For iOS or other mobile devices, fallback to the play store link (or app store if available in future)
      window.location.href = "https://play.google.com/store/apps/details?id=com.jharkhand.app";
    }
  };

  if (!isVisible) return null;

  return (
    <div style={styles.bannerContainer}>
      <button onClick={handleDismiss} style={styles.closeButton}>
        <X size={18} color="#666" />
      </button>
      
      <div style={styles.content}>
        <img 
          src="https://play-lh.googleusercontent.com/9nF_Xy1xQ0x9_9_9_9_9_9_9_9_9_9_9_9" 
          alt="App Icon" 
          style={styles.icon} 
          onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/5968/5968866.png'; }} // Fallback icon
        />
        <div style={styles.textContainer}>
          <h4 style={styles.title}>Jharkhand Updates</h4>
          <p style={styles.subtitle}>Fast, secure, and better experience</p>
        </div>
      </div>
      
      <button onClick={handleOpenApp} style={styles.openButton}>
        USE APP
      </button>
    </div>
  );
};

const styles = {
  bannerContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 15px',
    zIndex: 99999,
    boxSizing: 'border-box',
    borderBottom: '1px solid #e0e0e0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    padding: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    marginLeft: '10px',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    marginRight: '12px',
    objectFit: 'cover'
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    margin: 0,
    fontSize: '12px',
    color: '#777',
  },
  openButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textTransform: 'uppercase'
  }
};

export default SmartAppBanner;
