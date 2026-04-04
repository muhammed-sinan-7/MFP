import { useEffect, useState } from "react";
import { Headset, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../context/AuthContext";
import {
  createPublicSupportTicket,
  createSupportTicket,
  listSupportTickets,
} from "../services/supportService";

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  category: "general",
  priority: "normal",
  message: "",
};

function StatusBadge({ value }) {
  const palette = {
    open: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-slate-200 text-slate-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${palette[value] || "bg-slate-100 text-slate-700"}`}>
      {String(value || "open").replaceAll("_", " ")}
    </span>
  );
}

export default function SupportCenter({ publicOnly = false }) {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.isAuthenticated) && !publicOnly;
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    name: user?.email || "",
    email: user?.email || "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(isAuthenticated);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      setForm((prev) => ({
        ...prev,
        name: user?.email || prev.name,
        email: user?.email || prev.email,
      }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadTickets() {
      setLoadingTickets(true);
      try {
        const res = await listSupportTickets();
        setTickets(res.data || []);
      } catch {
        toast.error("Failed to load support tickets.");
      } finally {
        setLoadingTickets(false);
      }
    }

    loadTickets();
  }, [isAuthenticated]);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        subject: form.subject,
        category: form.category,
        priority: form.priority,
        message: form.message,
        name: form.name,
        email: form.email,
      };

      const res = isAuthenticated
        ? await createSupportTicket(payload)
        : await createPublicSupportTicket(payload);

      const nextTicket = res.data?.ticket;
      if (isAuthenticated && nextTicket) {
        setTickets((prev) => [nextTicket, ...prev]);
      }

      setForm({
        ...emptyForm,
        name: user?.email || "",
        email: user?.email || "",
      });
      toast.success("Support ticket submitted.");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Unable to submit support request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
              <LifeBuoy className="h-4 w-4" />
              Support
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Real support channel for users, reviewers, and platform partners
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Submit account, billing, publishing, or platform-connection issues here. Every request becomes a tracked ticket inside MFP.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { icon: Headset, title: "Tracked", text: "Every request gets a ticket record." },
              { icon: Mail, title: "Reachable", text: "Support can be contacted publicly." },
              { icon: ShieldCheck, title: "Review Ready", text: "Clear escalation path for platform reviewers." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white bg-white/90 p-4 shadow-sm">
                <item.icon className="h-5 w-5 text-sky-600" />
                <h2 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={`grid gap-6 ${isAuthenticated ? "xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]" : "grid-cols-1"}`}>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Open a Support Ticket</h2>
          <p className="mt-2 text-sm text-slate-500">
            Share the issue clearly and include the platform, workflow, and exact problem you saw.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {!isAuthenticated ? (
              <>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  required
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email"
                  type="email"
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                  required
                />
              </>
            ) : null}

            <input
              value={form.subject}
              onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Short summary"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="general">General</option>
                <option value="oauth">OAuth / Platform Approval</option>
                <option value="publishing">Publishing Issue</option>
                <option value="analytics">Analytics Issue</option>
                <option value="billing">Billing</option>
                <option value="security">Security / Compliance</option>
              </select>

              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <textarea
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Describe what happened, what you expected, and which platform/account was involved."
              rows={7}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </section>

        {isAuthenticated ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Your Tickets</h2>
                <p className="mt-1 text-sm text-slate-500">Track status and admin responses in one place.</p>
              </div>
            </div>

            {loadingTickets ? (
              <div className="mt-6 text-sm text-slate-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No tickets yet. Submit one from the form and it will appear here.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {tickets.map((ticket) => (
                  <article key={ticket.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{ticket.subject}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {ticket.category} · {ticket.priority}
                        </p>
                      </div>
                      <StatusBadge value={ticket.status} />
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-600">{ticket.message}</p>
                    {ticket.admin_response ? (
                      <div className="mt-4 rounded-2xl border border-sky-100 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Support Response</p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{ticket.admin_response}</p>
                      </div>
                    ) : null}
                    <p className="mt-4 text-xs text-slate-400">
                      Opened {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
