import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";

function LogIn() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [otpForm, setOtpForm] = useState({
    email: "",
    otp: "",
  });

  const [signinForm, setSigninForm] = useState({
    email: "",
    password: "",
  });

  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({
    email: "",
    token: "",
    newPassword: "",
  });

  const showPopup = (message, type = "info") =>
    type === "success" ? toast.success(message) : toast.error(message);

  // ===== API Handlers =====
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpForm.email }),
      });
      const result = await res.json();
      if (res.ok) {
        showPopup("OTP sent to your email!", "success");
        setIsOtpSent(true);
      } else {
        showPopup(result.message || "Failed to send OTP", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(otpForm),
      });
      const result = await res.json();
      if (res.ok) {
        showPopup("OTP verified successfully!", "success");
        setIsOtpVerified(true);
        setSignupForm({ ...signupForm, email: otpForm.email });
      } else {
        showPopup(result.message || "Invalid OTP", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const result = await res.json();
      if (res.ok) {
        showPopup("Signup successful!", "success");
        setRightPanelActive(false);
        setIsOtpSent(false);
        setIsOtpVerified(false);
      } else {
        showPopup(result.message || "Signup failed", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signinForm),
      });
      const result = await res.json();
      const token =
        result?.data?.accessToken || result?.accessToken || result?.token || null;

      if (res.ok && token) {
        localStorage.setItem("accessToken", token);
        showPopup("Login successful!", "success");
        navigate("/");
      } else {
        showPopup(result.message || "Invalid credentials", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(forgotForm),
        }
      );
      const result = await res.json();
      if (res.ok) {
        showPopup("Reset token sent to your email!", "success");
        setIsForgot(false);
        setIsReset(true);
      } else {
        showPopup(result.message || "Email not found", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resetForm),
        }
      );
      const result = await res.json();
      if (res.ok) {
        showPopup("Password reset successful!", "success");
        setIsReset(false);
        setRightPanelActive(false);
      } else {
        showPopup(result.message || "Reset failed", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-2">
        <div
          className={`relative w-full max-w-4xl min-h-[600px] rounded-xl shadow-xl overflow-hidden transition-all duration-700 ${
            rightPanelActive ? "right-panel-active" : ""
          }`}
        >
          {/* Sign In Panel */}
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
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signinForm.password}
                  onChange={(e) =>
                    setSigninForm({ ...signinForm, password: e.target.value })
                  }
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />
                <button className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition">
                  Sign In
                </button>
                <button className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded border border-gray-300 hover:bg-white hover:shadow-md transition">
                  <FcGoogle size={24} /> Sign in with Google
                </button>
                <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => setIsForgot(true)}
                    className="text-emerald-700 underline text-sm hover:text-emerald-800"
                  >
                    Forgot Password?
                  </button>
                 
                </div>
              </form>
            </div>
          )}

          {/* OTP & Signup Panel */}
          {rightPanelActive && (
            <div className="absolute top-0 right-0 md:w-1/2 w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-4 gap-3 transition-transform duration-700 ease-in-out">
              {!isOtpSent ? (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">
                    Sign Up - Send OTP
                  </h1>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={otpForm.email}
                    onChange={(e) =>
                      setOtpForm({ ...otpForm, email: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <button
                    onClick={handleSendOtp}
                    className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                  >
                    Send OTP
                  </button>
                   <button
                    type="button"
                     onClick={() => setRightPanelActive(false)}
                    className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                  >
                    Sign In
                  </button>
                </>
              ) : !isOtpVerified ? (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">
                    Verify OTP
                  </h1>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otpForm.otp}
                    onChange={(e) =>
                      setOtpForm({ ...otpForm, otp: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
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
                  <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">
                    Create Account
                  </h1>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={signupForm.firstName}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, firstName: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={signupForm.lastName}
                    onChange={(e) =>
                     
                    
                      setSignupForm({ ...signupForm, lastName: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={signupForm.email}
                    readOnly
                    className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm bg-gray-100"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                    className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                    required
                  />
                  <button
                    onClick={handleSignup}
                    className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setRightPanelActive(false);
                    }}
                    className="text-emerald-700 underline text-sm hover:text-emerald-800 mt-2"
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </div>
          )}

          {/* Forgot Password Panel */}
          {isForgot && (
            <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-4 gap-3 animate-fadeIn">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">
                Forgot Password
              </h1>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotForm.email}
                onChange={(e) =>
                  setForgotForm({ ...forgotForm, email: e.target.value })
                }
                className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
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
                className="text-emerald-700 underline text-sm hover:text-emerald-800 mt-2"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Reset Password Panel */}
          {isReset && (
            <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center p-6 sm:p-4 gap-3 animate-fadeIn">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-700 text-center">
                Reset Password
              </h1>
              <input
                type="email"
                placeholder="Email"
                value={resetForm.email}
                onChange={(e) =>
                  setResetForm({ ...resetForm, email: e.target.value })
                }
                className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                required
              />
              <input
                type="text"
                placeholder="Reset Token"
                value={resetForm.token}
                onChange={(e) =>
                  setResetForm({ ...resetForm, token: e.target.value })
                }
                className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                required
              />
              <input
                type="password"
                placeholder="New Password"
                value={resetForm.newPassword}
                onChange={(e) =>
                  setResetForm({ ...resetForm, newPassword: e.target.value })
                }
                className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
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
                className="text-emerald-700 underline text-sm hover:text-emerald-800 mt-2"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Overlay Panel */}
          {!isForgot && !isReset && (
            <div
              className="absolute top-0 md:left-1/2 left-0 md:w-1/2 w-full h-full overflow-hidden transition-transform duration-700 ease-in-out z-30"
              style={{
                transform: rightPanelActive
                  ? "translateX(-100%)"
                  : "translateX(0)",
              }}
            >
              <div className="relative w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center p-6 sm:p-4">
                {rightPanelActive ? (
                  <div className="text-center space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold">Welcome Back!</h1>
                    <p className="text-sm md:text-base">
                      Login with your info to continue
                    </p>
                    <button
                      onClick={() => setRightPanelActive(false)}
                      className="border border-white py-2 px-4 rounded hover:bg-white hover:text-emerald-700 transition"
                    >
                      Sign In
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold">Hello, Friend!</h1>
                    <p className="text-sm md:text-base">
                      Enter your details and start your journey with us
                    </p>
                    <button
                      onClick={() => setRightPanelActive(true)}
                      className="border border-white py-2 px-4 rounded hover:bg-white hover:text-emerald-300 transition"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default LogIn;
