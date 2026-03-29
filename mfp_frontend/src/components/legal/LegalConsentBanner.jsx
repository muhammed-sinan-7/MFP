import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "mfp_legal_consent_at";
const CONSENT_VALIDITY_MS = 30 * 24 * 60 * 60 * 1000;

export default function LegalConsentBanner() {
  const [visible, setVisible] = useState(() => {
    const raw = localStorage.getItem(CONSENT_KEY);
    const ts = Number(raw || 0);
    const valid = ts && Date.now() - ts < CONSENT_VALIDITY_MS;
    return !valid;
  });

  const expiresLabel = useMemo(() => "30 days", []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] w-[95%] max-w-3xl rounded-xl border border-slate-200 bg-white shadow-lg p-4">
      <p className="text-sm text-slate-700">
        By continuing, you agree to our{" "}
        <Link to="/terms" className="text-blue-600 hover:underline">
          Terms and Conditions
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
        . This preference is saved for {expiresLabel}.
      </p>
      <div className="mt-3 flex justify-end">
        <button
          onClick={accept}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
