import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  metaConnect,
  linkedinConnect,
  youtubeConnect,
} from "../../services/accountService";
import { toast } from "sonner";

function ConnectAccountModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const connect = async (fn) => {
    try {
      const { authorization_url } = await fn();
      window.location.href = authorization_url;
    } catch {
      toast.error("Authentication failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[480px] rounded-2xl p-5 sm:p-8 border border-gray-200 relative shadow-lg">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-5 sm:mb-6">
          Connect New Account
        </h2>

        <div className="space-y-4">
          <button
            onClick={() => connect(metaConnect)}
            className="w-full border border-gray-300 rounded-xl p-4 text-left hover:bg-gray-50"
          >
            <div className="font-medium">Meta (Facebook & Instagram)</div>
            <div className="text-xs text-gray-500">
              Connect Meta business accounts
            </div>
          </button>

          <button
            onClick={() => connect(linkedinConnect)}
            className="w-full border border-gray-300 rounded-xl p-4 text-left hover:bg-gray-50"
          >
            <div className="font-medium">LinkedIn</div>
            <div className="text-xs text-gray-500">
              Connect LinkedIn profile or organization
            </div>
          </button>

          <button
            onClick={() => connect(youtubeConnect)}
            className="w-full border border-gray-300 rounded-xl p-4 text-left hover:bg-gray-50"
          >
            <div className="font-medium">YouTube</div>
            <div className="text-xs text-gray-500">
              Connect YouTube channel
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectAccountModal;
