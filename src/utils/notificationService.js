// src/utils/notificationService.js

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.audio = null;
    this.initAudio();
  }

  // Initialize notification sound
  initAudio() {
    // You can use a custom sound or this default notification sound
    this.audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
    this.audio.volume = 0.5; // 50% volume
  }

  // Request permission from user
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    }

    this.permission = 'denied';
    return 'denied';
  }

  // Check if permission is granted
  hasPermission() {
    return Notification.permission === 'granted';
  }

  // Play notification sound
  playSound() {
    try {
      this.audio.currentTime = 0; // Reset to start
      this.audio.play().catch(err => {
        console.log('Could not play sound:', err);
      });
    } catch (err) {
      console.log('Error playing sound:', err);
    }
  }

  // Show browser notification
  showNotification(title, options = {}) {
    if (!this.hasPermission()) {
      console.log('Notification permission not granted');
      return null;
    }

    const defaultOptions = {
      icon: '/logo.png', // Your app logo
      badge: '/icon-192x192.png', // Small icon
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      requireInteraction: false, // Auto close after few seconds
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Play sound when notification shows
      this.playSound();

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Navigate to notification URL if provided
        if (options.url) {
          window.location.href = options.url;
        }
      };

      return notification;
    } catch (err) {
      console.error('Error showing notification:', err);
      return null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
