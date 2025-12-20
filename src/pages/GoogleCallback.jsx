import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 GoogleCallback: Checking for OAuth tokens...');
    
    const params = new URLSearchParams(location.search);
    const token = params.get('accessToken');
    const role = params.get('role');

    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Role found:', role || 'None');

    if (token && role) {
      console.log('🔑 Storing tokens (same as manual login)...');
      
      try {
        localStorage.setItem('accessToken', token);
        const formattedRole = role === 'ROLE_ADMIN' ? 'admin' : 'user';
        localStorage.setItem('role', formattedRole);

        console.log('✅ Tokens stored successfully!');
        console.log('   AccessToken:', localStorage.getItem('accessToken') ? 'Stored ✓' : 'Failed ✗');
        console.log('   Role:', localStorage.getItem('role'));

        toast.success('Login successful!', {
          position: "top-right",
          autoClose: 1500,
        });

        // ✅ NEW: Sync OneSignal Player ID to backend (OAuth login)
        setTimeout(async () => {
          try {
            const subscriptionId = await window.OneSignal?.User?.PushSubscription?.id;
            
            if (subscriptionId) {
              const response = await fetch('https://api.jharkhandbiharupdates.com/api/v1/user/onesignal-id', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ playerId: subscriptionId })
              });

              if (response.ok) {
                console.log("✅ OneSignal Player ID synced (OAuth):", subscriptionId);
              } else {
                console.error("❌ Failed to sync OneSignal ID:", response.status);
              }
            } else {
              console.warn("⚠️ No OneSignal subscription ID found yet");
            }
          } catch (e) {
            console.error("❌ Error syncing OneSignal ID:", e);
          }
        }, 2000); // Wait 2 seconds for OneSignal to be ready
        
        setTimeout(() => {
          console.log('🚀 Navigating to /jobs...');
          navigate('/jobs');
        }, 500);
        
      } catch (error) {
        console.error('❌ Error storing tokens:', error);
        toast.error('Error saving login data');
        navigate('/login');
      }
    } else {
      console.error('❌ No tokens found in URL');
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader />
        <h2 className="text-3xl font-bold text-emerald-700 mb-2 mt-6">
          Logging you in...
        </h2>
        <p className="text-gray-600">Please wait a moment</p>
      </div>
    </div>
  );
}

export default GoogleCallback;
