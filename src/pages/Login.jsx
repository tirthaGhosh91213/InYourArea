import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";

// Custom hook to detect media query matches
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
}

function LogIn() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // OAUTH ADDITION: Define the backend URL for Google OAuth2
  const GOOGLE_AUTH_URL = 'https://api.jharkhandbiharupdates.com/api/v1/oauth2/authorization/google';

  // Detect if screen is mobile width
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Forms
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [signinForm, setSigninForm] = useState({ email: "", password: "" });
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({
    email: "",
    token: "",
    newPassword: "",
  });

  // Toast helper (1.5 seconds)
  const showPopup = (msg, type = "success") =>
    toast[type](msg, { autoClose: 1500, position: "top-center" });

  // OAUTH ADDITION: This function handles the redirect to the backend for Google login
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  // ===== OTP Flow =====
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://api.jharkhandbiharupdates.com/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpForm.email }),
      });
      const result = await res.json();
      if (res.ok) {
        setIsOtpSent(true);
        showPopup("OTP sent to your email!");
      } else showPopup(result.message || "Failed to send OTP", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://api.jharkhandbiharupdates.com/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpForm),
      });
      const result = await res.json();
      if (res.ok) {
        setIsOtpVerified(true);
        setSignupForm({ ...signupForm, email: otpForm.email });
        showPopup("OTP verified successfully!");
      } else showPopup(result.message || "Invalid OTP", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://api.jharkhandbiharupdates.com/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const result = await res.json();
      if (res.ok) {
        showPopup("Signup successful!");
        setRightPanelActive(false);
        setIsOtpSent(false);
        setIsOtpVerified(false);
      } else showPopup(result.message || "Signup failed", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  // ===== LOGIN =====
const handleSignin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("https://api.jharkhandbiharupdates.com/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signinForm),
    });
    
    const result = await res.json();
    const token = result?.accessToken;
    const role = result?.role === "ROLE_ADMIN" ? "admin" : "user";

    if (res.ok && token) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", role);
      showPopup("Login successful!");

      // ✅ NEW: Sync OneSignal Player ID to backend
      setTimeout(async () => {
        try {
          const subscriptionId = await window.OneSignal?.User?.PushSubscription?.id;
          
          if (subscriptionId) {
            await fetch('https://api.jharkhandbiharupdates.com/api/v1/user/onesignal-id', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ playerId: subscriptionId })
            });
            
            console.log("✅ OneSignal Player ID synced:", subscriptionId);
          } else {
            console.warn("⚠️ No OneSignal subscription ID found yet");
          }
        } catch (e) {
          console.error("❌ Failed to sync OneSignal ID:", e);
        }
      }, 2000); // Wait 2 seconds for OneSignal to be ready

      setTimeout(() => {
        navigate("/community");
      }, 500);
    } else {
      showPopup(result.message || "Invalid credentials", "error");
    }
  } catch (err) {
    showPopup(err.message, "error");
  }
};


  // ===== FORGOT PASSWORD =====
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://api.jharkhandbiharupdates.com/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(forgotForm),
        }
      );
      const result = await res.json();
      if (res.ok) {
        showPopup("Reset token sent to your email!");
        setIsForgot(false);
        setIsReset(true);
      } else showPopup(result.message || "Email not found", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  // ===== RESET PASSWORD =====
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "https://api.jharkhandbiharupdates.com/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resetForm),
        }
      );
      const result = await res.json();
      if (res.ok) {
        showPopup("Password reset successful!");
        setIsReset(false);
        setRightPanelActive(false);
      } else showPopup(result.message || "Reset failed", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  // On mobile, always force showing Sign In first
  useEffect(() => {
    if (isMobile) {
      setRightPanelActive(false);
    }
  }, [isMobile]);

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4 sm:p-2">
        <div
          className={`relative w-full max-w-4xl min-h-[600px] rounded-xl shadow-xl overflow-hidden transition-all duration-700`}
        >
          {/* Mobile Layout: show either Sign In or Sign Up */}
          {isMobile ? (
            !isForgot && !isReset ? (
              <div className="w-full p-6">
                {!rightPanelActive ? (
                  <>
                    {/* ===== SIGN IN ===== */}
<form
  onSubmit={handleSignin}
  className="relative w-full max-w-sm mx-auto p-5 rounded-2xl backdrop-blur-lg bg-white/85 shadow-lg border border-emerald-100 flex flex-col items-center text-center space-y-5"
>
  {/* Header */}
  <div className="space-y-0.5">
    <h1 className="text-2xl font-extrabold text-emerald-700 tracking-tight">
      Welcome Back
    </h1>
    <p className="text-gray-600 text-xs">Sign in to continue your journey</p>
  </div>

  {/* Input Fields */}
  <div className="w-full space-y-3 text-left">
    {/* Email */}
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-0.5">
        Email
      </label>
      <input
        type="email"
        placeholder="Enter your email"
        value={signinForm.email}
        onChange={(e) =>
          setSigninForm({ ...signinForm, email: e.target.value })
        }
        className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 text-sm placeholder:text-gray-400 transition duration-200 bg-white shadow-sm"
        required
      />
    </div>

    {/* Password */}
    <div>
      <label className="block text-xs font-semibold text-emerald-700 mb-0.5">
        Password
      </label>
      <input
        type="password"
        placeholder="Enter your password"
        value={signinForm.password}
        onChange={(e) =>
          setSigninForm({ ...signinForm, password: e.target.value })
        }
        className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-400 text-sm placeholder:text-gray-400 transition duration-200 bg-white shadow-sm"
        required
      />
    </div>
  </div>

  {/* Sign In Button */}
  <button
    type="submit"
    className="w-full py-2.5 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transform hover:scale-[1.01] active:scale-95 transition duration-200 shadow-md"
  >
    Sign In
  </button>

  {/* Divider */}
  <div className="flex items-center gap-1 text-gray-500 text-xs ">
    <span className="flex-grow h-[1px] bg-gray-300" />
    or
    <span className="flex-grow h-[1px] bg-gray-300" />
  </div>

  {/* OAUTH ADDITION: Google Sign-In */}
  <button
    type="button"
    onClick={handleGoogleLogin}
    className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-white hover:shadow-md text-gray-700 text-sm font-medium transition-all"
  >
    <FcGoogle size={20} /> Continue with Google
  </button>

  {/* Forgot Password + Sign Up */}
  <div className="flex flex-col items-center w-full space-y-1 text-xs font-medium mt-1.5">
    <button
      type="button"
      onClick={() => setIsForgot(true)}
      className="text-emerald-600 pb-2 hover:text-emerald-800 transition-all duration-200 underline underline-offset-2"
    >
      Forgot Password?
    </button>
    <button
      type="button"
      onClick={() => setRightPanelActive(true)}
      className="relative group text-emerald-700 overflow-hidden px-1 pt-0.5 transition-all duration-200 ease-out"
    >
      <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-emerald-400 to-emerald-700 group-hover:w-full transition-all duration-300 ease-out"></span>
      <span className="relative group-hover:text-emerald-800">
        No account yet?{" "}
        <span className="font-semibold text-emerald-600 group-hover:text-emerald-800">
          Sign Up
        </span>
      </span>
    </button>
  </div>
</form>
                  </>
                ) : (
                  <>
                    {/* ===== SIGN UP / OTP ===== */}
                    {!isOtpSent ? (
                     <>
  <div className="w-full max-w-sm mx-auto p-6 rounded-3xl backdrop-blur-xl bg-white/80 shadow-2xl border border-emerald-100 flex flex-col items-center text-center space-y-5 animate-[fade-slide-up_0.8s_ease-in-out]">
    {/* Heading Section */}
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold mb-4 text-emerald-700 tracking-tight">
        Sign Up - Send OTP
      </h1>
      <p className="text-gray-600 text-sm">
        Get your verification code to continue
      </p>
    </div>

    {/* Email Input */}
    <div className="w-full text-left space-y-1">
      <label className="block text-sm font-semibold text-emerald-700 mb-1">
        Email Address
      </label>
      <input
        type="email"
        placeholder="Enter your email"
        value={otpForm.email}
        onChange={(e) => setOtpForm({ ...otpForm, email: e.target.value })}
        className="w-full p-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 text-sm bg-white shadow-md transition-all duration-300 placeholder:text-gray-400"
        required
      />
    </div>

    {/* Send OTP Button */}
    <button
      onClick={handleSendOtp}
      className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-lg transform hover:scale-[1.03] active:scale-95 transition duration-300"
    >
      Send OTP
    </button>

    {/* OAUTH ADDITION: Google Sign-In on Sign-up page */}
    <div className="flex items-center gap-1 text-gray-500 text-xs w-full">
        <span className="flex-grow h-[1px] bg-gray-300"></span>
        or
        <span className="flex-grow h-[1px] bg-gray-300"></span>
    </div>
    <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-white hover:shadow-md text-gray-700 text-sm font-medium transition-all"
    >
        <FcGoogle size={20} />
        Continue with Google
    </button>

    {/* Back to Sign In Link */}
    <button
      type="button"
      onClick={() => setRightPanelActive(false)}
      className="relative group text-emerald-700 text-sm font-medium overflow-hidden px-2 py-1"
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-400 to-emerald-700 group-hover:w-full transition-all duration-500 ease-out"></span>
      <span className="relative group-hover:text-emerald-800 group-hover:scale-105 transform transition duration-300 ease-out">
        Back to Sign In
      </span>
    </button>
  </div>

  {/* Custom Animation */}
  <style jsx>{`
    @keyframes fade-slide-up {
      0% {
        opacity: 0;
        transform: translateY(25px) scale(0.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}</style>
</>

                    ) : !isOtpVerified ? (
                      <>
  <div className="w-full max-w-sm mx-auto p-6 rounded-3xl backdrop-blur-xl bg-white/80 shadow-2xl border border-emerald-100 flex flex-col items-center text-center space-y-6 animate-[fade-slide-up_0.8s_ease-in-out]">
    {/* Header */}
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold text-emerald-700 drop-shadow-sm">
        Verify OTP
      </h1>
      <p className="text-gray-600 text-sm">
        Enter the 6-digit code sent to your email
      </p>
    </div>

    {/* OTP Input Display */}
    <div className="flex justify-center gap-3 mt-1">
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          value={otpForm.otp[index] || ""}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/, ""); // Allow only digits
            const otpArray = otpForm.otp.split("");
            otpArray[index] = value;
            setOtpForm({ ...otpForm, otp: otpArray.join("") });

            // Move focus to next box automatically
            if (value && e.target.nextSibling) {
              e.target.nextSibling.focus();
            }
          }}
          className="w-10 h-12 text-center text-lg font-semibold text-gray-800 bg-white border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 shadow-sm transition-all duration-300 backdrop-blur-sm"
        />
      ))}
    </div>

    {/* Verify Button */}
    <button
      onClick={handleVerifyOtp}
      className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-lg transform hover:scale-[1.03] active:scale-95 transition duration-300"
    >
      Verify OTP
    </button>

    {/* Helper Text */}
    <p className="text-xs text-gray-500">
      Didn’t receive the code?{" "}
      <button
        type="button"
        onClick={handleSendOtp}
        className="text-emerald-600 hover:text-emerald-800 font-medium transition-all"
      >
        Resend
      </button>
    </p>

    {/* Back to Signup */}
    <button
      type="button"
      onClick={() => setIsOtpSent(false)}
      className="relative group text-emerald-700 text-sm font-medium overflow-hidden px-2 py-1"
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-400 to-emerald-700 group-hover:w-full transition-all duration-500 ease-out"></span>
      <span className="relative group-hover:text-emerald-800 group-hover:scale-105 transform transition duration-300 ease-out">
        Back to Sign Up
      </span>
    </button>
  </div>

  {/* Animation */}
  <style jsx>{`
    @keyframes fade-slide-up {
      0% {
        opacity: 0;
        transform: translateY(25px) scale(0.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}</style>
</>

                    ) : (
                    <>
  <div className="w-full max-w-sm mx-auto p-6 rounded-3xl backdrop-blur-xl bg-white/85 shadow-2xl border border-emerald-100 flex flex-col items-center text-center space-y-5 animate-[fade-slide-up_0.8s_ease-in-out]">
    {/* Heading */}
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold text-emerald-700 drop-shadow-sm">
        Create Account
      </h1>
      <p className="text-gray-600 text-sm">
        Fill in your details to complete registration
      </p>
    </div>

    {/* Input Fields */}
    <div className="w-full space-y-3 text-left">
      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          First Name
        </label>
        <input
          type="text"
          placeholder="First Name"
          value={signupForm.firstName}
          onChange={(e) =>
            setSignupForm({ ...signupForm, firstName: e.target.value })
          }
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 text-sm shadow-sm transition-all duration-300 placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          Last Name
        </label>
        <input
          type="text"
          placeholder="Last Name"
          value={signupForm.lastName}
          onChange={(e) =>
            setSignupForm({ ...signupForm, lastName: e.target.value })
          }
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 text-sm shadow-sm transition-all duration-300 placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          Email Address
        </label>
        <input
          type="email"
          value={signupForm.email}
          readOnly
          className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 text-sm shadow-inner cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          Password
        </label>
        <input
          type="password"
          placeholder="Password"
          value={signupForm.password}
          onChange={(e) =>
            setSignupForm({ ...signupForm, password: e.target.value })
          }
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 text-sm shadow-sm transition-all duration-300 placeholder:text-gray-400"
          required
        />
      </div>
    </div>

    {/* Sign Up Button */}
    <button
      onClick={handleSignup}
      className="w-full mt-2 py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-lg transform hover:scale-[1.03] active:scale-95 transition duration-300"
    >
      Create Account
    </button>

    {/* Back Button */}
    <button
      type="button"
      onClick={() => {
        setIsOtpSent(false);
        setIsOtpVerified(false);
        setRightPanelActive(false);
      }}
      className="relative group text-emerald-700 text-sm font-medium overflow-hidden px-2 py-1"
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-400 to-emerald-700 group-hover:w-full transition-all duration-500 ease-out"></span>
      <span className="relative group-hover:text-emerald-800 group-hover:scale-105 transform transition duration-300 ease-out">
        Back to Sign In
      </span>
    </button>
  </div>

  {/* Animation */}
  <style jsx>{`
    @keyframes fade-slide-up {
      0% {
        opacity: 0;
        transform: translateY(25px) scale(0.97);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}</style>
</>

                    )}
                  </>
                )}
              </div>
            ) : isForgot ? (
              <>
  <div className="w-full max-w-sm mx-auto p-6 rounded-3xl backdrop-blur-xl bg-white/85 shadow-2xl border border-emerald-100 flex flex-col items-center text-center space-y-6 animate-[fade-slide-up_0.8s_ease-in-out]">
    {/* Header */}
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold text-emerald-700 drop-shadow-sm">
        Forgot Password
      </h1>
      <p className="text-gray-600 text-sm">
        Enter your registered email to receive a reset link
      </p>
    </div>

    {/* Email Input */}
    <div className="w-full text-left">
      <label className="block text-sm font-semibold text-emerald-700 mb-1">
        Email Address
      </label>
      <input
        type="email"
        placeholder="Enter your email"
        value={forgotForm.email}
        onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
        className="w-full p-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-400 text-sm shadow-sm transition-all duration-300 bg-white"
        required
      />
    </div>

    {/* Send Reset Token Button */}
    <button
      onClick={handleForgotPassword}
      className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-lg transform hover:scale-[1.03] active:scale-95 transition duration-300"
    >
      Send Reset Token
    </button>

    {/* Helpful Tip */}
    <p className="text-xs text-gray-500">
      Check your email inbox or spam folder for further instructions.
    </p>

    {/* Back to Sign In */}
    <button
      onClick={() => setIsForgot(false)}
      className="relative group text-emerald-700 text-sm font-medium overflow-hidden px-2 py-1"
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-400 to-emerald-700 group-hover:w-full transition-all duration-500 ease-out"></span>
      <span className="relative group-hover:text-emerald-800 group-hover:scale-105 transform transition duration-300 ease-out">
        Back to Sign In
      </span>
    </button>
  </div>

  {/* Subtle Animation */}
  <style jsx>{`
    @keyframes fade-slide-up {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}</style>
</>

            ) : (
             <>
  <div className="w-full max-w-sm mx-auto p-6 rounded-3xl backdrop-blur-xl bg-white/85 shadow-2xl border border-emerald-100 flex flex-col items-center text-center space-y-6 animate-[fade-slide-up_0.8s_ease-in-out]">
    {/* Header */}
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold text-emerald-700 drop-shadow-sm">
        Reset Password
      </h1>
      <p className="text-gray-600 text-sm">
        Enter your email, token, and new password below
      </p>
    </div>

    {/* Form Inputs */}
    <div className="w-full space-y-3 text-left">
      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Your registered email"
          value={resetForm.email}
          onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-400 text-sm shadow-sm transition-all duration-300"
          required
        />
      </div>

      {/* Token */}
      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          Reset Token
        </label>
        <input
          type="text"
          placeholder="Enter reset token"
          value={resetForm.token}
          onChange={(e) => setResetForm({ ...resetForm, token: e.target.value })}
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-400 text-sm shadow-sm transition-all duration-300"
          required
        />
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-semibold text-emerald-700 mb-0.5">
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          value={resetForm.newPassword}
          onChange={(e) =>
            setResetForm({ ...resetForm, newPassword: e.target.value })
          }
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-400 text-sm shadow-sm transition-all duration-300"
          required
        />
      </div>
    </div>

    {/* Submit Button */}
    <button
      onClick={handleResetPassword}
      className="w-full mt-2 py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 shadow-lg transform hover:scale-[1.03] active:scale-95 transition duration-300"
    >
      Reset Password
    </button>

    {/* Tip */}
    <p className="text-xs text-gray-500">
      After resetting, you’ll be redirected to your Sign In page.
    </p>

    {/* Back Button */}
    <button
      onClick={() => setIsReset(false)}
      className="relative group text-emerald-700 text-sm font-medium overflow-hidden px-2 py-1"
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-400 to-emerald-700 group-hover:w-full transition-all duration-500 ease-out"></span>
      <span className="relative group-hover:text-emerald-800 group-hover:scale-105 transform transition duration-300 ease-out">
        Back to Sign In
      </span>
    </button>
  </div>

  {/* Smooth Animation */}
  <style jsx>{`
    @keyframes fade-slide-up {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.97);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}</style>
</>

            )
          ) : (
            // Desktop layout: show both panels with overlay effect
            <div
              className={`relative w-full max-w-4xl min-h-[600px] rounded-xl shadow-xl overflow-hidden transition-all duration-700 ${
                rightPanelActive ? "right-panel-active" : ""
              }`}
            >
              {/* ===== SIGN IN ===== */}
              {!isForgot && !isReset && !rightPanelActive && (
                <div className="absolute top-0 left-0 md:w-1/2 w-full h-full bg-white z-20 flex flex-col items-center justify-center p-6 sm:p-4 gap-4 transition-transform duration-700 ease-in-out">
                  <form
                    onSubmit={handleSignin}
                    className="flex flex-col items-center justify-center w-full gap-3"
                  >
                    <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">
                      Sign In
                    </h1>
                    <input
                      type="email"
                      placeholder="Email"
                      value={signinForm.email}
                      onChange={(e) =>
                        setSigninForm({ ...signinForm, email: e.target.value })
                      }
                      className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={signinForm.password}
                      onChange={(e) =>
                        setSigninForm({
                          ...signinForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                      required
                    />
                    <button className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition">
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded border border-gray-300 hover:bg-white hover:shadow-md transition"
                    >
                      <FcGoogle size={24} /> Sign in with Google
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-emerald-700 underline text-sm hover:text-emerald-800"
                    >
                      Forgot Password?
                    </button>
                  </form>
                </div>
              )}

              {/* ===== SIGN UP / OTP ===== */}
              {rightPanelActive && (
                <div className="absolute top-0 right-0 md:w-1/2 w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-4 gap-3 transition-transform duration-700 ease-in-out">
                  {!isOtpSent ? (
                    <>
                      <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
                        Sign Up - Send OTP
                      </h1>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={otpForm.email}
                        onChange={(e) =>
                          setOtpForm({ ...otpForm, email: e.target.value })
                        }
                        className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                        required
                      />
                      <button
                        onClick={handleSendOtp}
                        className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                      >
                        Send OTP
                      </button>

                      <div className="flex items-center gap-2 text-gray-500 text-xs w-full max-w-sm">
                        <span className="flex-grow h-[1px] bg-gray-300"></span>
                        or
                        <span className="flex-grow h-[1px] bg-gray-300"></span>
                      </div>
                      <button
                          type="button"
                          onClick={handleGoogleLogin}
                          className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded border border-gray-300 hover:bg-white hover:shadow-md transition">
                          <FcGoogle size={24} /> Sign up with Google
                      </button>

                      <button
                        type="button"
                        onClick={() => setRightPanelActive(false)}
                        className="text-emerald-700 underline text-sm hover:text-emerald-800"
                      >
                        Back to Sign In
                      </button>
                    </>
                  ) : !isOtpVerified ? (
                    <>
                      <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
                        Verify OTP
                      </h1>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otpForm.otp}
                        onChange={(e) =>
                          setOtpForm({ ...otpForm, otp: e.target.value })
                        }
                        className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                        required
                      />
                      <button
                        onClick={handleVerifyOtp}
                        className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                      >
                        Verify OTP
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
                        Create Account
                      </h1>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={signupForm.firstName}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={signupForm.lastName}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            lastName: e.target.value,
                          })
                        }
                        className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                        required
                      />
                      <input
                        type="email"
                        value={signupForm.email}
                        readOnly
                        className="w-full max-w-sm p-3 border border-gray-300 rounded bg-gray-100"
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={signupForm.password}
                        onChange={(e) =>
                          setSignupForm({
                            ...signupForm,
                            password: e.target.value,
                          })
                        }
                        className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                        required
                      />
                      <button
                        onClick={handleSignup}
                        className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ===== FORGOT PASSWORD ===== */}
              {isForgot && (
                <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-4 gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
                    Forgot Password
                  </h1>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotForm.email}
                    onChange={(e) =>
                      setForgotForm({ ...forgotForm, email: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <button
                    onClick={handleForgotPassword}
                    className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                  >
                    Send Reset Token
                  </button>
                  <button
                    onClick={() => setIsForgot(false)}
                    className="text-emerald-700 underline text-sm hover:text-emerald-800"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* ===== RESET PASSWORD ===== */}
              {isReset && (
                <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-4 gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">
                    Reset Password
                  </h1>
                  <input
                    type="email"
                    placeholder="Email"
                    value={resetForm.email}
                    onChange={(e) =>
                      setResetForm({ ...resetForm, email: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Reset Token"
                    value={resetForm.token}
                    onChange={(e) =>
                      setResetForm({ ...resetForm, token: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={resetForm.newPassword}
                    onChange={(e) =>
                      setResetForm({
                        ...resetForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <button
                    onClick={handleResetPassword}
                    className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => setIsReset(false)}
                    className="text-emerald-700 underline text-sm hover:text-emerald-800"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* ===== OVERLAY ===== */}
              {!isForgot && !isReset && (
                <div
                  className="absolute top-0 md:left-1/2 left-0 md:w-1/2 w-full h-full transition-transform duration-700 ease-in-out z-30"
                  style={{
                    transform: rightPanelActive
                      ? "translateX(-100%)"
                      : "translateX(0)",
                  }}
                >
                  <div className="relative w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center p-6 sm:p-4">
                    {rightPanelActive ? (
                      <div className="text-center space-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold">
                          Welcome Back!
                        </h1>
                        <p>Login with your info to continue</p>
                        <button
                          onClick={() => setRightPanelActive(false)}
                          className="border border-white py-2 px-4 rounded hover:bg-white hover:text-emerald-700 transition"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <h1 className="text-2xl md:text-3xl font-bold">
                          Hello, Friend!
                        </h1>
                        <p>Enter your details and start your journey with us</p>
                        <button
                          onClick={() => setRightPanelActive(true)}
                          className="border border-white py-2 px-4 rounded hover:bg-white hover:text-emerald-700 transition"
                        >
                          Sign Up
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LogIn;
