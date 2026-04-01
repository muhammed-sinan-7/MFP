import { useEffect, useMemo, useState } from "react";
import { Shield, Users, Building2, FileText, Link2, ScrollText, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import {
  createAdminOrganization,
  createAdminUser,
  deleteAdminOrganization,
  deleteAdminPost,
  deleteAdminSocialAccount,
  deleteAdminUser,
  getAdminOverview,
  listAdminAuditLogs,
  listAdminOrganizations,
  listAdminPosts,
  listAdminSocialAccounts,
  listAdminUsers,
  restoreAdminOrganization,
  restoreAdminPost,
  updateAdminOrganization,
  updateAdminPost,
  updateAdminSocialAccount,
  updateAdminUser,
} from "../services/adminService";
import { getIndustries } from "../services/settingsService";

const tabs = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "users", label: "Users", icon: Users },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "accounts", label: "Social Accounts", icon: Link2 },
  { id: "audit", label: "Audit Logs", icon: ScrollText },
];

const emptyUserForm = {
  email: "",
  password: "",
  is_active: true,
  is_staff: false,
  is_superuser: false,
  is_email_verified: true,
};

const emptyOrgForm = {
  name: "",
  tagline: "",
  industry: "",
  logo: null,
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

function TableShell({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [orgForm, setOrgForm] = useState(emptyOrgForm);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [includeDeletedPosts, setIncludeDeletedPosts] = useState(true);
  const [includeDeletedOrgs, setIncludeDeletedOrgs] = useState(true);

  const loadOverview = async () => {
    const res = await getAdminOverview();
    setOverview(res.data);
  };

  const loadTab = async (tab = activeTab, query = search) => {
    setTabLoading(true);
    try {
      if (tab === "overview") {
        await loadOverview();
      } else if (tab === "users") {
        const res = await listAdminUsers({ q: query || undefined, page_size: 50 });
        setUsers(res.data.results || []);
      } else if (tab === "organizations") {
        const res = await listAdminOrganizations({
          q: query || undefined,
          include_deleted: includeDeletedOrgs ? 1 : undefined,
          page_size: 50,
        });
        setOrganizations(res.data.results || []);
      } else if (tab === "posts") {
        const res = await listAdminPosts({
          q: query || undefined,
          include_deleted: includeDeletedPosts ? 1 : undefined,
          page_size: 50,
        });
        setPosts(res.data.results || []);
      } else if (tab === "accounts") {
        const res = await listAdminSocialAccounts({ q: query || undefined, page_size: 50 });
        setAccounts(res.data.results || []);
      } else if (tab === "audit") {
        const res = await listAdminAuditLogs({ q: query || undefined, page_size: 50 });
        setAuditLogs(res.data.results || []);
      }
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    loadOverview().catch(() => toast.error("Failed to load admin overview"));
    getIndustries()
      .then((res) => setIndustries(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadTab().catch(() => toast.error(`Failed to load ${activeTab}`));
  }, [activeTab, includeDeletedPosts, includeDeletedOrgs]);

  const summaryCards = useMemo(() => {
    if (!overview) return [];
    return [
      { label: "Users", value: overview.users?.total || 0, hint: `${overview.users?.staff || 0} staff` },
      { label: "Organizations", value: overview.organizations?.total || 0, hint: `${overview.organizations?.deleted || 0} archived` },
      { label: "Posts", value: overview.posts?.total || 0, hint: `${overview.posts?.deleted || 0} deleted` },
      { label: "Social Accounts", value: overview.social_accounts?.total || 0, hint: `${overview.social_accounts?.expired || 0} expired` },
    ];
  }, [overview]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();
    try {
      await loadTab(activeTab, search);
    } catch {
      toast.error("Search failed");
    }
  };

  const submitUser = async () => {
    try {
      const payload = { ...userForm };
      if (!payload.password) {
        delete payload.password;
      }

      if (editingUserId) {
        await updateAdminUser(editingUserId, payload);
        toast.success("User updated");
      } else {
        await createAdminUser(payload);
        toast.success("User created");
      }
      setUserForm(emptyUserForm);
      setEditingUserId(null);
      await loadTab("users");
      await loadOverview();
    } catch (error) {
      toast.error(error.response?.data?.email?.[0] || "Unable to save user");
    }
  };

  const submitOrganization = async () => {
    try {
      const payload = new FormData();
      payload.append("name", orgForm.name);
      payload.append("tagline", orgForm.tagline);
      if (orgForm.industry) payload.append("industry", orgForm.industry);
      if (orgForm.logo instanceof File) payload.append("logo", orgForm.logo);

      if (editingOrgId) {
        await updateAdminOrganization(editingOrgId, payload);
        toast.success("Organization updated");
      } else {
        await createAdminOrganization(payload);
        toast.success("Organization created");
      }
      setOrgForm(emptyOrgForm);
      setEditingOrgId(null);
      await loadTab("organizations");
      await loadOverview();
    } catch (error) {
      toast.error(error.response?.data?.name?.[0] || "Unable to save organization");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Platform Admin"
        subtitle="Manage the whole product from one in-app control center."
        action={
          <button
            onClick={() => loadTab().catch(() => toast.error("Refresh failed"))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab !== "overview" ? (
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search current admin tab..."
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm"
          />
          <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Search
          </button>
          {activeTab === "posts" ? (
            <label className="text-sm text-slate-600">
              <input
                type="checkbox"
                checked={includeDeletedPosts}
                onChange={(e) => setIncludeDeletedPosts(e.target.checked)}
                className="mr-2"
              />
              Include deleted posts
            </label>
          ) : null}
          {activeTab === "organizations" ? (
            <label className="text-sm text-slate-600">
              <input
                type="checkbox"
                checked={includeDeletedOrgs}
                onChange={(e) => setIncludeDeletedOrgs(e.target.checked)}
                className="mr-2"
              />
              Include archived organizations
            </label>
          ) : null}
        </form>
      ) : null}

      {tabLoading ? <div className="rounded-2xl bg-white p-8 text-sm text-slate-500 shadow-sm">Loading admin data...</div> : null}

      {activeTab === "overview" && overview ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <TableShell>
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent Users</h3>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Org</th>
                  <th className="px-6 py-3">Flags</th>
                </tr>
              </thead>
              <tbody>
                {(overview.recent_users || []).map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.organization_name || "-"}</td>
                    <td className="px-6 py-3">{user.is_staff ? "Staff" : "User"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>

          <TableShell>
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Recent Organizations</h3>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Members</th>
                </tr>
              </thead>
              <tbody>
                {(overview.recent_organizations || []).map((org) => (
                  <tr key={org.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{org.name}</td>
                    <td className="px-6 py-3">{org.industry_name || "-"}</td>
                    <td className="px-6 py-3">{org.member_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      ) : null}

      {activeTab === "users" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{editingUserId ? "Edit User" : "Create User"}</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm" placeholder="Email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} />
              <input className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm" placeholder="Password" type="password" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} />
              {[
                ["is_active", "Active"],
                ["is_staff", "Staff"],
                ["is_superuser", "Superuser"],
                ["is_email_verified", "Email Verified"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" checked={Boolean(userForm[key])} onChange={(e) => setUserForm((p) => ({ ...p, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
              <div className="flex gap-2">
                <button onClick={submitUser} type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  {editingUserId ? "Save User" : "Create User"}
                </button>
                <button onClick={() => { setUserForm(emptyUserForm); setEditingUserId(null); }} type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <TableShell>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Organization</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Flags</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{user.email}</td>
                    <td className="px-6 py-3">{user.organization_name || "-"}</td>
                    <td className="px-6 py-3">{user.organization_role || "-"}</td>
                    <td className="px-6 py-3 text-xs">{user.is_superuser ? "Superuser" : user.is_staff ? "Staff" : "User"}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditingUserId(user.id); setUserForm({ email: user.email, password: "", is_active: user.is_active, is_staff: user.is_staff, is_superuser: user.is_superuser, is_email_verified: user.is_email_verified }); }} className="text-blue-600">Edit</button>
                        <button type="button" onClick={async () => { await deleteAdminUser(user.id); toast.success("User deactivated"); await loadTab("users"); await loadOverview(); }} className="text-rose-600">Deactivate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      ) : null}

      {activeTab === "organizations" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{editingOrgId ? "Edit Organization" : "Create Organization"}</h3>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm" placeholder="Organization name" value={orgForm.name} onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))} />
              <input className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm" placeholder="Tagline" value={orgForm.tagline} onChange={(e) => setOrgForm((p) => ({ ...p, tagline: e.target.value }))} />
              <select className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm" value={orgForm.industry} onChange={(e) => setOrgForm((p) => ({ ...p, industry: e.target.value }))}>
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>{industry.name}</option>
                ))}
              </select>
              <input type="file" onChange={(e) => setOrgForm((p) => ({ ...p, logo: e.target.files?.[0] || null }))} className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm" />
              <div className="flex gap-2">
                <button onClick={submitOrganization} type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  {editingOrgId ? "Save Organization" : "Create Organization"}
                </button>
                <button onClick={() => { setOrgForm(emptyOrgForm); setEditingOrgId(null); }} type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <TableShell>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Members</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{org.name}</td>
                    <td className="px-6 py-3">{org.industry_name || "-"}</td>
                    <td className="px-6 py-3">{org.member_count}</td>
                    <td className="px-6 py-3">{org.is_deleted ? "Archived" : "Active"}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditingOrgId(org.id); setOrgForm({ name: org.name || "", tagline: org.tagline || "", industry: org.industry || "", logo: null }); }} className="text-blue-600">Edit</button>
                        {org.is_deleted ? (
                          <button type="button" onClick={async () => { await restoreAdminOrganization(org.id); toast.success("Organization restored"); await loadTab("organizations"); await loadOverview(); }} className="text-emerald-600">Restore</button>
                        ) : (
                          <button type="button" onClick={async () => { await deleteAdminOrganization(org.id); toast.success("Organization archived"); await loadTab("organizations"); await loadOverview(); }} className="text-rose-600">Archive</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      ) : null}

      {activeTab === "posts" ? (
        <TableShell>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Platforms</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t border-slate-100 align-top">
                  <td className="px-6 py-3">{post.organization_name}</td>
                  <td className="px-6 py-3">{post.author_email || "-"}</td>
                  <td className="px-6 py-3">
                    <div className="space-y-1">
                      {(post.platforms || []).map((platform) => (
                        <div key={platform.id} className="text-xs text-slate-600">
                          <span className="font-semibold capitalize">{platform.provider}</span>: {platform.caption || "No caption"}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-3">{post.is_deleted ? "Deleted" : "Active"}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={async () => { await updateAdminPost(post.id, { is_deleted: !post.is_deleted }); toast.success("Post updated"); await loadTab("posts"); await loadOverview(); }} className="text-blue-600">
                        {post.is_deleted ? "Mark Active" : "Mark Deleted"}
                      </button>
                      {post.is_deleted ? (
                        <button type="button" onClick={async () => { await restoreAdminPost(post.id); toast.success("Post restored"); await loadTab("posts"); await loadOverview(); }} className="text-emerald-600">
                          Restore
                        </button>
                      ) : (
                        <button type="button" onClick={async () => { await deleteAdminPost(post.id); toast.success("Post archived"); await loadTab("posts"); await loadOverview(); }} className="text-rose-600">
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : null}

      {activeTab === "accounts" ? (
        <TableShell>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Account</th>
                <th className="px-6 py-3">Targets</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-t border-slate-100">
                  <td className="px-6 py-3">{account.organization_name}</td>
                  <td className="px-6 py-3 capitalize">{account.provider}</td>
                  <td className="px-6 py-3">{account.account_name}</td>
                  <td className="px-6 py-3">{account.target_count}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const nextName = window.prompt("Update account name", account.account_name);
                          if (!nextName || nextName === account.account_name) return;
                          await updateAdminSocialAccount(account.id, { account_name: nextName });
                          toast.success("Account updated");
                          await loadTab("accounts");
                        }}
                        className="text-blue-600"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateAdminSocialAccount(account.id, { is_active: false });
                          toast.success("Account status updated");
                          await loadTab("accounts");
                          await loadOverview();
                        }}
                        className="text-amber-600"
                        disabled={!account.is_active}
                      >
                        Deactivate
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteAdminSocialAccount(account.id);
                          toast.success("Account disconnected");
                          await loadTab("accounts");
                          await loadOverview();
                        }}
                        className="text-rose-600"
                      >
                        Disconnect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : null}

      {activeTab === "audit" ? (
        <TableShell>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Actor</th>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Severity</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-6 py-3">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-3">{log.actor_email || "-"}</td>
                  <td className="px-6 py-3">{log.organization_name || "-"}</td>
                  <td className="px-6 py-3">{log.action}</td>
                  <td className="px-6 py-3">{log.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : null}
    </div>
  );
}

export default AdminPanel;
