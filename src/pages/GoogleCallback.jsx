import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { syncPlayerIdToBackend } from '../utils/onesignalSync';

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
        console.log(
          '   AccessToken:',
          localStorage.getItem('accessToken') ? 'Stored ✓' : 'Failed ✗'
        );
        console.log('   Role:', localStorage.getItem('role'));

        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 1500,
        });

        // ✅ Sync OneSignal Player ID to backend (OAuth login)
        setTimeout(async () => {
          try {
            const subscriptionId =
              await window.OneSignal?.User?.PushSubscription?.id;

            if (subscriptionId) {
              await syncPlayerIdToBackend(subscriptionId, token);
            } else {
              console.warn(
                '⚠️ No OneSignal subscription ID found yet (OAuth callback)'
              );
            }
          } catch (e) {
            console.error('❌ Error getting OneSignal ID:', e);
          }
        }, 2000); // Wait 2 seconds for OneSignal to be ready

        setTimeout(() => {
          console.log('🚀 Navigating to /Community...');
          navigate('/community');
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
