import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc"; // Google Icon

function LogIn() {
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [signinForm, setSigninForm] = useState({
    email: "",
    password: "",
  });

  const [forgotForm, setForgotForm] = useState({
    email: "",
  });

  const [resetForm, setResetForm] = useState({
    email: "",
    token: "",
    newPassword: "",
  });

  const showPopup = (message, type = "info") =>
    type === "success" ? toast.success(message) : toast.error(message);

  // 🔹 Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const result = await res.json();
      console.log("Signup:", result);
      if (res.ok) {
        showPopup("Signup successful!", "success");
        setRightPanelActive(false);
      } else {
        showPopup(result.message || "Signup failed", "error");
      }
    } catch (err) {
      showPopup(err.message, "error");
    }
  };

  // 🔹 Signin
  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signinForm),
      });
      const result = await res.json();
      console.log("Login:", result);

      const token =
        result?.data?.accessToken ||
        result?.accessToken ||
        result?.token ||
        null;

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

  // 🔹 Forgot Password
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
      console.log("Forgot Password:", result);
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

  // 🔹 Reset Password
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
      console.log("Reset Password:", result);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
        <div
          className={`relative w-full max-w-4xl min-h-[520px] rounded-xl shadow-xl overflow-hidden transition-all duration-700 ${
            rightPanelActive ? "right-panel-active" : ""
          }`}
        >
          {/* Sign In Panel */}
          {!isForgot && !isReset && (
            <div
              className={`absolute top-0 left-0 md:w-1/2 w-full h-full bg-white transition-transform duration-700 ease-in-out ${
                rightPanelActive ? "z-10" : "z-20"
              }`}
              style={{
                transform: rightPanelActive
                  ? "translateX(100%)"
                  : "translateX(0)",
              }}
            >
              <form
                onSubmit={handleSignin}
                className="flex flex-col items-center justify-center h-full p-8 gap-4 animate-fadeIn"
              >
                <h1 className="text-3xl font-bold text-emerald-700">Sign In</h1>

                <input
                  type="email"
                  name="email"
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
                  name="password"
                  placeholder="Password"
                  value={signinForm.password}
                  onChange={(e) =>
                    setSigninForm({ ...signinForm, password: e.target.value })
                  }
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />

                <button
                  type="submit"
                  className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className="w-full max-w-sm flex items-center justify-center gap-2 py-3 rounded border border-gray-300 hover:bg-white hover:shadow-md transition"
                >
                  <FcGoogle size={24} /> Sign in with Google
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-emerald-700 underline text-sm hover:text-emerald-800 mt-2"
                >
                  Forgot Password?
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password */}
          {isForgot && (
            <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center p-8 gap-4 animate-fadeIn">
              <h1 className="text-3xl font-bold text-emerald-700">
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
              />
              <button
                onClick={handleForgotPassword}
                className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
              >
                Reset OTP
              </button>
              <button
                onClick={() => setIsForgot(false)}
                className="text-emerald-700 underline text-sm hover:text-emerald-800"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Reset Password */}
          {isReset && (
            <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center p-8 gap-4 animate-fadeIn">
              <h1 className="text-3xl font-bold text-emerald-700">
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
              />
              <input
                type="text"
                placeholder="Reset Token"
                value={resetForm.token}
                onChange={(e) =>
                  setResetForm({ ...resetForm, token: e.target.value })
                }
                className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
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
                className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
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

          {/* Sign Up Panel */}
          {!isForgot && !isReset && (
            <div
              className={`absolute top-0 right-0 md:w-1/2 w-full bg-white h-full transition-transform duration-700 ease-in-out ${
                rightPanelActive ? "z-20" : "z-10"
              }`}
              style={{
                transform: rightPanelActive
                  ? "translateX(0)"
                  : "translateX(100%)",
              }}
            >
              <form
                onSubmit={handleSignup}
                className="flex flex-col items-center justify-center h-full p-8 gap-4 animate-fadeIn"
              >
                <h1 className="text-3xl font-bold text-emerald-700">
                  Create Account
                </h1>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={signupForm.firstName}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={signupForm.lastName}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full max-w-sm p-3 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-emerald-400 transition"
                  required
                />
                <button
                  type="submit"
                  className="w-full max-w-sm py-3 rounded font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition"
                >
                  Sign Up
                </button>
              </form>
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
              <div className="relative w-full h-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-white flex items-center justify-center p-8 animate-fadeIn">
                {rightPanelActive ? (
                  <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold">Welcome Back!</h1>
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
                    <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                    <p>Enter your details and start your journey with us</p>
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
