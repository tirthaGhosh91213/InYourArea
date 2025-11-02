import React, { useState, useEffect } from "react";

import Footer from "./Footer";

export default function EmailService() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [unsubscribeEmail, setUnsubscribeEmail] = useState("");
  const [unsubscribeStatus, setUnsubscribeStatus] = useState(null);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (status === "SUCCESS") {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Auto-hide unsubscribe status after 3 seconds
  useEffect(() => {
    if (unsubscribeStatus === "SUCCESS") {
      const timer = setTimeout(() => {
        setUnsubscribeStatus(null);
        setShowUnsubscribeModal(false);
        setUnsubscribeEmail("");
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [unsubscribeStatus]);

  const handleSubmit = async () => {
    if (!email) {
      alert("Please enter an email address.");
      return;
    }

    try {
      // Send email as URL query parameter, matching your Postman request
      const response = await fetch(`https://cached-nursery-kevin-advances.trycloudflare.com//api/v1/subscribe?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setStatus("SUCCESS");
        setEmail("");
      } else {
        setStatus("ERROR");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setStatus("ERROR");
    }
  };

  const handleUnsubscribe = async () => {
    if (!unsubscribeEmail) {
      alert("Please enter an email address.");
      return;
    }

    try {
      const response = await fetch(`https://cached-nursery-kevin-advances.trycloudflare.com//api/v1/subscribe?email=${encodeURIComponent(unsubscribeEmail)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setUnsubscribeStatus("SUCCESS");
        setUnsubscribeEmail("");
      } else {
        setUnsubscribeStatus("ERROR");
      }
    } catch (error) {
      console.error("Unsubscribe error:", error);
      setUnsubscribeStatus("ERROR");
    }
  };
  // <Footer />

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @supports (backdrop-filter: blur(10px)) {
          .backdrop-blur-sm {
            backdrop-filter: blur(10px);
          }
        }
      `}</style>
      

      <div className="min-h-screen bg-gray-50">
        {/* Success Toast Popup */}
        {status === "SUCCESS" && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-green-400 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[320px]">
              {/* Green checkmark circle */}
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              
              {/* Success message */}
              <div className="flex-1">
                <h3 className="font-bold text-lg">Successfully Subscribed!</h3>
                <p className="text-sm text-white text-opacity-90">
                  You'll receive updates soon.
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setStatus(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Unsubscribe Success Toast */}
        {unsubscribeStatus === "SUCCESS" && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className="bg-red-500 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[320px]">
              <div className="w-10 h-10 bg-white bg-opacity-30 rounded-full flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Successfully Unsubscribed!</h3>
                <p className="text-sm text-white text-opacity-90">
                  You've been removed from our list.
                </p>
              </div>
              <button
                onClick={() => setUnsubscribeStatus(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Unsubscribe Modal with transparent/blurred background */}
        {showUnsubscribeModal && (
          <div 
            className="fixed inset-0 flex items-center justify-center z-50 px-4" 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUnsubscribeModal(false);
                setUnsubscribeEmail("");
                setUnsubscribeStatus(null);
              }
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
              {/* Close button */}
              <button
                onClick={() => {
                  setShowUnsubscribeModal(false);
                  setUnsubscribeEmail("");
                  setUnsubscribeStatus(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal content */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe</h2>
                <p className="text-gray-600">Enter your email address to unsubscribe from our newsletter.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-medium">
                    Your email:
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={unsubscribeEmail}
                    onChange={(e) => setUnsubscribeEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleUnsubscribe()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
                  />
                </div>

                <button
                  onClick={handleUnsubscribe}
                  className="w-full bg-red-500 text-white font-bold py-3 rounded-md hover:bg-red-600 transition-colors text-base"
                >
                  Unsubscribe
                </button>

                {unsubscribeStatus === "ERROR" && (
                  <p className="text-red-600 text-sm font-semibold text-center">
                    Failed to unsubscribe. Please try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative" style={{ backgroundColor: "#e5f6fd", overflow: "hidden" }}>
          {/* Yellow Circle Decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full -translate-y-1/2 translate-x-1/3 z-0"></div>
          
          <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Form */}
              <div className="relative z-10 max-w-lg">
                <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Get personalised <span className="text-green-400">local<br />news</span> to your <span className="text-green-400">inbox</span>
                </h1>
                <p className="text-gray-400 mb-8 text-base">
                  To get started enter your email below
                </p>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2 font-medium">
                      Your email:
                    </label>
                    <input
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      disabled={showUnsubscribeModal}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={showUnsubscribeModal}
                    className="w-full bg-green-400 text-white font-bold py-3 rounded-md hover:bg-green-500 transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Subscribe
                  </button>
                </div>

                {/* Status Messages */}
                {status === "ERROR" && (
                  <p className="text-red-600 mt-4 font-semibold text-sm">
                    Subscription failed. Please try again.
                  </p>
                )}

                {/* Terms Text */}
                <p className="text-xs text-gray-600 mt-6 leading-relaxed">
                  By signing up, you agree to the Terms of Service and How we use your data. InYourArea and Reach plc will use your sign-up to email content, improve understanding of you and serve you via other consented channels. These may include adverts from us and 3rd parties based on our understanding. <span 
                    className="font-bold cursor-pointer hover:text-red-500 transition-colors underline"
                    onClick={() => setShowUnsubscribeModal(true)}
                  >
                    You can unsubscribe at any time.
                  </span>
                </p>
              </div>

              {/* Right Column - Phone Image with Grey Spot */}
              <div className="relative flex justify-center lg:justify-end items-center">
                {/* Grey circular spot behind phone */}
                <div className="absolute w-80 h-80 bg-gray-200 rounded-full opacity-60 -right-20 top-1/2 -translate-y-1/2 z-0"></div>
                
                {/* Phone Image */}
                <img 
                  src="https://res.cloudinary.com/dkgwi1xvx/image/upload/v1761422166/Phone4_fjw23t.png" 
                  alt="Phone mockup" 
                  className="relative w-full max-w-sm h-auto object-contain z-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          {/* News Updates */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-green-400 rounded-3xl flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">News Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                Every morning and evening, you'll get the latest local news headlines delivered straight to your inbox. This means you'll never miss a beat when it comes to knowing exactly what's happening where you live, day and night.
              </p>
            </div>
          </div>

          {/* Weather and Travel */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Weather and Travel</h2>
              <p className="text-gray-700 leading-relaxed">
                Making sure you're prepared for the day ahead is paramount, and is why we provide a daily weather forecast PLUS the latest updates on your local transport networks. So whether you're travelling to work or travelling home, we'll help you get there as quickly and effortlessly as possible.
              </p>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <div className="w-32 h-32 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Discover other news nearby */}
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover other news nearby</h2>
              <p className="text-gray-700 leading-relaxed">
                If knowing what's happening on your doorstep isn't enough, your twice daily newsletter will even show you the latest news from nearby postcodes as well. This gives you an even greater idea of what's happening in and around your area.
              </p>
            </div>
          </div>

          {/* Public Notices */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Public Notices</h2>
              <p className="text-gray-700 leading-relaxed">
                Due to popular demand, we've recently added Public Notices to your daily newsletters. Whether it's being informed about recently deceased local residents, recent planning permissions or legal notices, we'll make sure you're the first to know.
              </p>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <div className="w-32 h-32 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Why Subscribe Section */}
        <div className="py-20" style={{ backgroundColor: "#f8fdff" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Phone Image */}
              <div className="flex justify-center">
                <img 
                  src="https://res.cloudinary.com/dkgwi1xvx/image/upload/v1761422166/Phone4_fjw23t.png" 
                  alt="Newsletter preview on phone" 
                  className="w-full max-w-sm h-auto object-contain"
                />
              </div>

              {/* Right - Content */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Subscribe?</h2>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    We're proud to provide our valued and loyal subscribers with the very best in local news and relevant local information every single day. It's easy to see why we send over 10 million emails every month!
                  </p>
                  
                  <p>
                    Our twice daily email newsletters will ultimately save you a bundle of time and effort. In the fast paced world we now live in, having only the very best pieces of information delivered straight to your inbox rather than having to go and search for it all, will definitely make your life that little bit easier.
                  </p>
                  
                  <p>
                    Sign up for free today to see what the fuss is all about and we guarantee you'll never miss a local news story again.
                  </p>
                </div>

                {/* Info Box */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm space-y-4 text-sm text-gray-700">
                  <p>
                    • Please remember that you can unsubscribe from our daily newsletter at any time. Simply click the unsubscribe link at the very bottom of the email. Maybe once a day is too much for you? If that's the case, you can always choose to receive it just on a sunday morning. If you're a registered user with InYourArea you can take control of your newsletter settings within your account.
                  </p>
                  
                  <p>
                    • If there is any information you think we should included in our daily newsletters that we currently don't, then we would love to hear about it. You can email us at <a href="mailto:info@inyourarea.co.uk" className="text-green-400 hover:underline font-semibold">info@inyourarea.co.uk</a> with your suggestions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
  
}