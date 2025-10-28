import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600 mb-4"></div>
        <h2 className="text-3xl font-bold text-emerald-700 mb-2">
          Logging you in...
        </h2>
        <p className="text-gray-600">Please wait a moment</p>
      </div>
    </div>
  );
}

export default GoogleCallback;
