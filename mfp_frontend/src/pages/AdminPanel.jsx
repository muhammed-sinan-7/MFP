import { useEffect, useMemo, useState } from "react";
import { Shield, Users, Building2, FileText, Link2, ScrollText, RefreshCcw, Tags, Newspaper, LifeBuoy } from "lucide-react";
import { toast } from "sonner";

import {
  createAdminIndustry,
  createAdminNewsSource,
  createAdminOrganization,
  createAdminUser,
  deleteAdminIndustry,
  deleteAdminNewsSource,
  deleteAdminOrganization,
  deleteAdminPost,
  deleteAdminSocialAccount,
  deleteAdminUser,
  getAdminOverview,
  listAdminAuditLogs,
  listAdminIndustries,
  listAdminNewsSources,
  listAdminOrganizations,
  listAdminPosts,
  listAdminSocialAccounts,
  listAdminSupportTickets,
  listAdminUsers,
  restoreAdminOrganization,
  restoreAdminPost,
  updateAdminIndustry,
  updateAdminNewsSource,
  updateAdminOrganization,
  updateAdminPost,
  updateAdminSocialAccount,
  updateAdminSupportTicket,
  updateAdminUser,
} from "../services/adminService";
import { getIndustries } from "../services/settingsService";

const tabs = [
  { id: "overview", label: "Overview", icon: Shield },
  { id: "users", label: "Users", icon: Users },
  { id: "organizations", label: "Organizations", icon: Building2 },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "accounts", label: "Social Accounts", icon: Link2 },
  { id: "support", label: "Support", icon: LifeBuoy },
  { id: "industries", label: "Industries", icon: Tags },
  { id: "news", label: "News Sources", icon: Newspaper },
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

const emptyIndustryForm = {
  name: "",
  slug: "",
};

const emptyNewsSourceForm = {
  name: "",
  rss_url: "",
  industry: "",
  is_active: true,
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
  const [industryRows, setIndustryRows] = useState([]);
  const [newsSources, setNewsSources] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [orgForm, setOrgForm] = useState(emptyOrgForm);
  const [editingOrgId, setEditingOrgId] = useState(null);
  const [industryForm, setIndustryForm] = useState(emptyIndustryForm);
  const [editingIndustryId, setEditingIndustryId] = useState(null);
  const [newsSourceForm, setNewsSourceForm] = useState(emptyNewsSourceForm);
  const [editingNewsSourceId, setEditingNewsSourceId] = useState(null);
  const [includeDeletedPosts, setIncludeDeletedPosts] = useState(true);
  const [includeDeletedOrgs, setIncludeDeletedOrgs] = useState(true);
  const [includeInactiveNewsSources, setIncludeInactiveNewsSources] = useState(true);

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
      } else if (tab === "support") {
        const res = await listAdminSupportTickets({ q: query || undefined, page_size: 50 });
        setSupportTickets(res.data.results || []);
      } else if (tab === "industries") {
        const res = await listAdminIndustries({ q: query || undefined, page_size: 50 });
        setIndustryRows(res.data.results || []);
      } else if (tab === "news") {
        const res = await listAdminNewsSources({
          q: query || undefined,
          include_inactive: includeInactiveNewsSources ? 1 : undefined,
          page_size: 50,
        });
        setNewsSources(res.data.results || []);
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
  }, [activeTab, includeDeletedPosts, includeDeletedOrgs, includeInactiveNewsSources]);

  const summaryCards = useMemo(() => {
    if (!overview) return [];
    return [
      { label: "Users", value: overview.users?.total || 0, hint: `${overview.users?.staff || 0} staff` },
      { label: "Organizations", value: overview.organizations?.total || 0, hint: `${overview.organizations?.deleted || 0} archived` },
      { label: "Posts", value: overview.posts?.total || 0, hint: `${overview.posts?.deleted || 0} deleted` },
      { label: "Social Accounts", value: overview.social_accounts?.total || 0, hint: `${overview.social_accounts?.expired || 0} expired` },
      { label: "Support Tickets", value: overview.support_tickets?.total || 0, hint: `${overview.support_tickets?.open || 0} open` },
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

  const submitIndustry = async () => {
    try {
      const payload = {
        name: industryForm.name,
        slug: industryForm.slug || undefined,
      };

      if (editingIndustryId) {
        await updateAdminIndustry(editingIndustryId, payload);
        toast.success("Industry updated");
      } else {
        await createAdminIndustry(payload);
        toast.success("Industry created");
      }

      setIndustryForm(emptyIndustryForm);
      setEditingIndustryId(null);
      await loadTab("industries");
    } catch (error) {
      toast.error(error.response?.data?.name?.[0] || error.response?.data?.slug?.[0] || "Unable to save industry");
    }
  };

  const submitNewsSource = async () => {
    try {
      const payload = {
        name: newsSourceForm.name,
        rss_url: newsSourceForm.rss_url,
        industry: newsSourceForm.industry || null,
        is_active: Boolean(newsSourceForm.is_active),
      };

      if (editingNewsSourceId) {
        await updateAdminNewsSource(editingNewsSourceId, payload);
        toast.success("News source updated");
      } else {
        await createAdminNewsSource(payload);
        toast.success("News source created");
      }

      setNewsSourceForm(emptyNewsSourceForm);
      setEditingNewsSourceId(null);
      await loadTab("news");
    } catch (error) {
      toast.error(error.response?.data?.rss_url?.[0] || error.response?.data?.name?.[0] || "Unable to save news source");
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
          {activeTab === "news" ? (
            <label className="text-sm text-slate-600">
              <input
                type="checkbox"
                checked={includeInactiveNewsSources}
                onChange={(e) => setIncludeInactiveNewsSources(e.target.checked)}
                className="mr-2"
              />
              Include inactive sources
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

      {activeTab === "support" ? (
        <TableShell>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3">Requester</th>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {supportTickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-slate-100 align-top">
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">{ticket.name}</div>
                    <div className="text-xs text-slate-500">{ticket.email}</div>
                  </td>
                  <td className="px-6 py-3">{ticket.organization_name || "-"}</td>
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-900">{ticket.subject}</div>
                    <div className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">{ticket.message}</div>
                    {ticket.admin_response ? (
                      <div className="mt-2 rounded-xl bg-slate-50 p-2 text-xs text-slate-600">
                        Reply: {ticket.admin_response}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-3 capitalize">{ticket.priority}</td>
                  <td className="px-6 py-3 capitalize">{String(ticket.status || "").replaceAll("_", " ")}</td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const reply = window.prompt("Reply to this ticket", ticket.admin_response || "");
                          if (reply === null) return;
                          await updateAdminSupportTicket(ticket.id, {
                            admin_response: reply,
                            status: reply ? "in_progress" : ticket.status,
                          });
                          toast.success("Support ticket updated");
                          await loadTab("support");
                          await loadOverview();
                        }}
                        className="text-blue-600"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateAdminSupportTicket(ticket.id, { status: "resolved" });
                          toast.success("Ticket marked resolved");
                          await loadTab("support");
                          await loadOverview();
                        }}
                        className="text-emerald-600"
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateAdminSupportTicket(ticket.id, { status: "closed" });
                          toast.success("Ticket closed");
                          await loadTab("support");
                          await loadOverview();
                        }}
                        className="text-rose-600"
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : null}

      {activeTab === "industries" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{editingIndustryId ? "Edit Industry" : "Create Industry"}</h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
                placeholder="Industry name"
                value={industryForm.name}
                onChange={(e) => setIndustryForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
                placeholder="Slug (optional)"
                value={industryForm.slug}
                onChange={(e) => setIndustryForm((p) => ({ ...p, slug: e.target.value }))}
              />
              <div className="flex gap-2">
                <button onClick={submitIndustry} type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  {editingIndustryId ? "Save Industry" : "Create Industry"}
                </button>
                <button onClick={() => { setIndustryForm(emptyIndustryForm); setEditingIndustryId(null); }} type="button" className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600">
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
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">News Sources</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {industryRows.map((industry) => (
                  <tr key={industry.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">{industry.name}</td>
                    <td className="px-6 py-3">{industry.slug}</td>
                    <td className="px-6 py-3">{industry.source_count}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIndustryId(industry.id);
                            setIndustryForm({ name: industry.name || "", slug: industry.slug || "" });
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteAdminIndustry(industry.id);
                            toast.success("Industry deleted");
                            await loadTab("industries");
                          }}
                          className="text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
      ) : null}

      {activeTab === "news" ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">{editingNewsSourceId ? "Edit News Source" : "Create News Source"}</h3>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
                placeholder="Source name"
                value={newsSourceForm.name}
                onChange={(e) => setNewsSourceForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
                placeholder="RSS URL"
                value={newsSourceForm.rss_url}
                onChange={(e) => setNewsSourceForm((p) => ({ ...p, rss_url: e.target.value }))}
              />
              <select
                className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm"
                value={newsSourceForm.industry}
                onChange={(e) => setNewsSourceForm((p) => ({ ...p, industry: e.target.value }))}
              >
                <option value="">Select industry</option>
                {industries.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={Boolean(newsSourceForm.is_active)}
                  onChange={(e) => setNewsSourceForm((p) => ({ ...p, is_active: e.target.checked }))}
                />
                Source active
              </label>
              <div className="flex gap-2">
                <button onClick={submitNewsSource} type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                  {editingNewsSourceId ? "Save Source" : "Create Source"}
                </button>
                <button
                  onClick={() => {
                    setNewsSourceForm(emptyNewsSourceForm);
                    setEditingNewsSourceId(null);
                  }}
                  type="button"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600"
                >
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
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Articles</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {newsSources.map((source) => (
                  <tr key={source.id} className="border-t border-slate-100">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-800">{source.name}</div>
                      <div className="text-xs text-slate-500">{source.rss_url}</div>
                    </td>
                    <td className="px-6 py-3">{source.industry_name || "-"}</td>
                    <td className="px-6 py-3">{source.is_active ? "Active" : "Inactive"}</td>
                    <td className="px-6 py-3">{source.article_count}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNewsSourceId(source.id);
                            setNewsSourceForm({
                              name: source.name || "",
                              rss_url: source.rss_url || "",
                              industry: source.industry || "",
                              is_active: Boolean(source.is_active),
                            });
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await updateAdminNewsSource(source.id, { is_active: !source.is_active });
                            toast.success("Source status updated");
                            await loadTab("news");
                          }}
                          className="text-amber-600"
                        >
                          {source.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteAdminNewsSource(source.id);
                            toast.success("News source deleted");
                            await loadTab("news");
                          }}
                          className="text-rose-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
        </div>
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
