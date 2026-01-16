import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

function ResetPasswordInput({ resetForm, setResetForm }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full max-w-sm">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="New Password"
        value={resetForm.newPassword}
        onChange={(e) =>
          setResetForm({
            ...resetForm,
            newPassword: e.target.value,
          })
        }
        className="w-full p-3 pr-12 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-400 transition"
        required
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
      >
        {showPassword ? (
          <AiOutlineEyeInvisible size={22} />
        ) : (
          <AiOutlineEye size={22} />
        )}
      </button>
    </div>
  );
}

export default ResetPasswordInput;
