import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
  socialList,
  refreshAccount,
  disconnectAccount,
} from "../services/accountService";
import ConnectAccountModal from "../components/connectaccountmodel/ConnectAccountModal";
import { toast } from "sonner";

function ConnectedAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [syncingMeta, setSyncingMeta] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await socialList();
      const list = data.data || [];
      setAccounts(list);
      setError(null);

      const hasMeta = list.some((acc) => acc.provider === "meta");
      const hasInstagramTarget = list.some((acc) =>
        (acc.publishing_targets || []).some((target) => target.provider === "instagram"),
      );
      setSyncingMeta(hasMeta && !hasInstagramTarget);
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const onFocus = () => {
      fetchAccounts();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchAccounts]);

  useEffect(() => {
    if (!syncingMeta) return;
    const timer = setInterval(() => {
      fetchAccounts();
    }, 5000);
    return () => clearInterval(timer);
  }, [syncingMeta, fetchAccounts]);

  const handleRefresh = async (accountId) => {
    try {
      await refreshAccount(accountId);
      toast.success("Refresh triggered");
      setTimeout(() => {
        fetchAccounts();
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh");
    }
  };

  const handleDisconnect = async (accountId) => {
    setDisconnectLoading(true);
    try {
      await disconnectAccount(accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      toast.success("Account disconnected");
      setDisconnectTarget(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to disconnect");
    } finally {
      setDisconnectLoading(false);
    }
  };

  const calculateTokenHealth = (expiresAt) => {
    if (!expiresAt) return 0;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const totalDuration = 60 * 24 * 60 * 60 * 1000;
    const remaining = expiry - now;
    const percentage = (remaining / totalDuration) * 100;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  };

  const flattenedTargets = useMemo(
    () =>
      accounts.flatMap((account) =>
        (account.publishing_targets || []).map((target) => ({
          ...target,
          parentAccount: account,
        })),
      ),
    [accounts],
  );

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const healthy = flattenedTargets.filter(
    (t) => calculateTokenHealth(t.parentAccount.token_expires_at) > 60,
  ).length;

  const alerts = flattenedTargets.filter(
    (t) => calculateTokenHealth(t.parentAccount.token_expires_at) < 20,
  ).length;

  return (
    <div className="space-y-8">
      <ConnectAccountModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          fetchAccounts();
        }}
      />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">Connected Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your organization's social platform integrations.
          </p>
          {syncingMeta && (
            <p className="text-xs text-amber-600 mt-2">
              Meta pages are connected. Instagram targets are syncing and should appear shortly.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <SummaryCard title="Healthy" value={healthy} />
        <SummaryCard title="Alerts" value={alerts} />
        <SummaryCard title="Total Profiles" value={flattenedTargets.length} />
        <SummaryCard title="Platforms" value={accounts.length} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {flattenedTargets.map((target) => {
          const tokenHealth = calculateTokenHealth(
            target.parentAccount.token_expires_at,
          );

          return (
            <div
              key={target.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{target.display_name}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                  Active
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-4">{target.provider}</p>

              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Token Health</span>
                  <span>{tokenHealth}%</span>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${tokenHealth}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Expires on {" "}
                  {new Date(
                    target.parentAccount.token_expires_at,
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => handleRefresh(target.parentAccount.id)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Refresh
                </button>
                <button
                  onClick={() =>
                    setDisconnectTarget({
                      accountId: target.parentAccount.id,
                      name: target.display_name || target.provider,
                    })
                  }
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  Disconnect
                </button>
              </div>
            </div>
          );
        })}

        <div
          onClick={() => setShowModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition"
        >
          <PlusIcon className="w-6 h-6 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">Connect New Account</p>
        </div>
      </div>

      <ConfirmDisconnectModal
        isOpen={Boolean(disconnectTarget)}
        accountName={disconnectTarget?.name}
        loading={disconnectLoading}
        onClose={() => {
          if (!disconnectLoading) setDisconnectTarget(null);
        }}
        onConfirm={() => {
          if (!disconnectTarget?.accountId) return;
          handleDisconnect(disconnectTarget.accountId);
        }}
      />
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function ConfirmDisconnectModal({
  isOpen,
  accountName,
  loading,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Disconnect Account?
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {accountName
              ? `This will disconnect ${accountName}. You can reconnect it later if needed.`
              : "This will disconnect the selected account. You can reconnect it later if needed."}
          </p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectedAccounts;
