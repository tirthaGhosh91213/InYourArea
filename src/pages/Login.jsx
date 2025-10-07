import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc"; // Google Icon

function LogIn() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    mob_no: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [signinForm, setSigninForm] = useState({ email: "", password: "", role: "USER" });
  const navigate = useNavigate();

  const showPopup = (message, type) => {
    type === "success" ? toast.success(message) : toast.error(message);
  };

  const handleSignupChange = (e) => setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  const handleSigninChange = (e) => setSigninForm({ ...signinForm, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
    if (!signupForm.email) return showPopup("Please enter your email", "error");
    try {
      const res = await fetch("http://localhost:8000/api/v1/otp/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupForm.email }),
      });
      const result = await res.json();
      res.ok ? (showPopup(result.data || "OTP sent!", "success"), setOtpSent(true)) 
             : showPopup(result.apiError?.message || "Error sending OTP", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleVerifyOtp = async () => {
    if (!signupForm.otp) return showPopup("Enter OTP", "error");
    try {
      const res = await fetch("http://localhost:8000/api/v1/otp/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupForm.email, otp: signupForm.otp }),
      });
      const result = await res.json();
      res.ok ? (showPopup(result.data || "OTP verified!", "success"), setOtpVerified(true))
             : showPopup(result.apiError?.message || "OTP failed", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!otpVerified) return showPopup("Verify OTP first", "error");
    try {
      const user = { ...signupForm };
      const res = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const result = await res.json();
      res.ok ? (showPopup(`Signup successful! ${result.message || ""}`, "success"), setRightPanelActive(false))
             : showPopup(result.apiError?.message || "Signup failed", "error");
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
        body: JSON.stringify({ email: signinForm.email, password: signinForm.password }),
      });
      const result = await res.json();
      if (res.ok) {
        const roles = result?.data?.roles ?? [];
        const primaryRole = Array.isArray(roles) ? roles[0] ?? "USER" : roles;
        localStorage.setItem("accessToken", result.data.accessToken);
        localStorage.setItem("roles", JSON.stringify(roles));
        localStorage.setItem("primaryRole", primaryRole);
        if (signinForm.role.toUpperCase() !== primaryRole) {
          toast.info(`Your role is ${primaryRole}. Continuing with that role.`);
        }
        showPopup("Login successful!", "success");
        primaryRole === "ADMIN" ? navigate("/admin") : navigate("/");
      } else showPopup(result.apiError?.message || "Login failed", "error");
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
        <div className={`relative w-full max-w-4xl min-h-[520px] rounded-xl shadow-xl overflow-hidden transition-all duration-700 ${rightPanelActive ? "right-panel-active" : ""}`}>
          
          {/* Sign In Panel */}
          <div className={`absolute top-0 left-0 md:w-1/2 w-full h-full bg-white transition-transform duration-700 ease-in-out ${rightPanelActive ? "z-10" : "z-20"}`} style={{ transform: rightPanelActive ? "translateX(100%)" : "translateX(0)" }}>
            <form onSubmit={handleSignin} className="flex flex-col items-center justify-center h-full p-8 gap-4 animate-fadeIn">
              <h1 className="text-3xl font-bold text-emerald-700">Sign In</h1>

              <input type="email" name="email" placeholder="Email" value={signinForm.email} onChange={handleSigninChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required />
              <input type="password" name="password" placeholder="Password" value={signinForm.password} onChange={handleSigninChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required />

              <select name="role" value={signinForm.role} onChange={handleSigninChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button type="submit" className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition">Sign In</button>

              <button type="button" className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded border border-gray-300 hover:bg-white hover:shadow-md transition">
                <FcGoogle size={24} /> Sign in with Google
              </button>
            </form>
          </div>

          {/* Sign Up Panel */}
          <div className={`absolute top-0 right-0 md:w-1/2 w-full bg-white h-full transition-transform duration-700 ease-in-out ${rightPanelActive ? "z-20" : "z-10"}`} style={{ transform: rightPanelActive ? "translateX(0)" : "translateX(100%)" }}>
            <form onSubmit={handleSignup} className="flex flex-col items-center justify-center h-full p-8 gap-4 animate-fadeIn">
              <h1 className="text-3xl font-bold text-emerald-700">Create Account</h1>

              <input type="text" name="name" placeholder="Name" value={signupForm.name} onChange={handleSignupChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required disabled={otpSent} />
              <input type="email" name="email" placeholder="Email" value={signupForm.email} onChange={handleSignupChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required disabled={otpSent} />

              {!otpSent && <button type="button" onClick={handleSendOtp} className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition">Send OTP</button>}

              {otpSent && !otpVerified && (
                <div className="w-full max-w-sm flex gap-2">
                  <input type="text" name="otp" placeholder="Enter OTP" value={signupForm.otp} onChange={handleSignupChange} className="flex-1 p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required />
                  <button type="button" onClick={handleVerifyOtp} className="px-4 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition">Verify</button>
                </div>
              )}

              {otpVerified && (
                <>
                  <input type="password" name="password" placeholder="Password" value={signupForm.password} onChange={handleSignupChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required />
                  <input type="text" name="mob_no" placeholder="Mobile no." value={signupForm.mob_no} onChange={handleSignupChange} className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition" required />
                  <button type="submit" className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition">Sign Up</button>
                </>
              )}
            </form>
          </div>

          {/* Overlay Panel */}
          <div className="absolute top-0 md:left-1/2 left-0 md:w-1/2 w-full h-full overflow-hidden transition-transform duration-700 ease-in-out z-30" style={{ transform: rightPanelActive ? "translateX(-100%)" : "translateX(0)" }}>
            <div className="relative w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center p-8 animate-fadeIn">
              {rightPanelActive ? (
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-bold">Welcome Back!</h1>
                  <p>Login with your info to continue</p>
                  <button onClick={() => setRightPanelActive(false)} className="border border-white py-2 px-4 rounded hover:bg-white hover:text-emerald-700 transition">Sign In</button>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                  <p>Enter your details and start your journey with us</p>
                  <button onClick={() => setRightPanelActive(true)} className="border border-white py-2 px-4 rounded hover:bg-white hover:text-emerald-300 transition">Sign Up</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default LogIn;
