import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema } from "../validation/otpSchema";
import { verifyOtp, resendOtp } from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { BRAND_LOGO, BRAND_NAME } from "../config/brand";
import { getUserFacingError } from "../services/errorUtils";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email || sessionStorage.getItem("otpEmail");
  const [serverError, setServerError] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [isLocked, setIsLocked] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (!email && typeof window !== "undefined") {
      navigate("/register");
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const onSubmit = async (data) => {
    setServerError(null);
    try {
      const normalizedOtp = data.otp.replace(/\D/g, "").slice(0, 6);
      const response = await verifyOtp({
        email,
        otp: normalizedOtp,
      });
      const { access, id, email: verifiedEmail } = response.data;
      login({ access, id, email: verifiedEmail });
      sessionStorage.removeItem("otpEmail");
      navigate("/onboarding");
    } catch (error) {
      const res = error.response?.data;
      const serializerError =
        res && typeof res === "object"
          ? Object.values(res).flat().find((value) => typeof value === "string")
          : null;

      setServerError(res?.error || serializerError || getUserFacingError(error, "Verification failed."));
      if (res?.attempts_left !== undefined) setAttemptsLeft(res.attempts_left);
      if (res?.locked) setIsLocked(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center overflow-hidden">
      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Logo */}
      <div className="absolute top-10 flex items-center gap-2">
        <img src={BRAND_LOGO} alt={BRAND_NAME} className="w-10 h-10 rounded-xl shadow-lg shadow-blue-200" />
        <span className="text-2xl font-black tracking-tight text-slate-800">{BRAND_NAME}</span>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
          {/* Shield Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <ShieldCheckIcon className="w-7 h-7 text-blue-600" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold mb-3 text-slate-800">Check your email</h2>
          <p className="text-slate-500 text-sm mb-10 leading-relaxed">
            We’ve sent a 6-digit secure code to <br />
            <span className="text-blue-600 font-semibold">{email || "your email"}</span>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="relative">
              <input
                {...register("otp")}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                disabled={isSubmitting || isLocked}
                placeholder="000000"
                className="w-full bg-transparent border-none text-center text-5xl tracking-[0.4em] font-bold focus:outline-none focus:ring-0 placeholder-slate-200 text-blue-600 relative z-10"
              />
              {/* Visual Grid Underlay */}
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-16 border-b-2 border-slate-200 bg-slate-50/50 rounded-lg transition-all"
                  ></div>
                ))}
              </div>
            </div>

            {errors.otp && (
              <p className="text-red-500 text-xs font-medium bg-red-50 py-1 rounded-full">{errors.otp.message}</p>
            )}

            {serverError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-red-600 text-sm font-semibold">{serverError}</p>
                {!isLocked && attemptsLeft < 5 && (
                  <p className="text-red-400 text-xs mt-1">Remaining: {attemptsLeft} attempts</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
              {!isSubmitting && <span className="text-xl">→</span>}
            </button>

            {isLocked && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-amber-700 text-sm font-bold">Account Temporarily Locked</p>
                <p className="text-amber-600 text-xs mt-1">Please request a fresh code to continue.</p>
              </div>
            )}
          </form>

          {/* Resend Section */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">Didn't get the code?</span>
              <button
                disabled={cooldown > 0}
                onClick={async () => {
                  try {
                    await resendOtp({ email });
                    setServerError(null);
                    setAttemptsLeft(5);
                    setIsLocked(false);
                    setCooldown(60);
                  } catch (error) {
                    setServerError(getUserFacingError(error, "Failed to resend OTP."));
                  }
                }}
                className={`font-bold transition-colors ${
                  cooldown > 0 ? "text-slate-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Now"}
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="mt-10 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors mx-auto uppercase tracking-widest"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Change Email
          </button>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-10 flex justify-center gap-6 opacity-60">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 256-bit AES
           </span>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             GDPR Compliant
           </span>
        </div>
      </div>
    </div>
  );
}
