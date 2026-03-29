import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, PlayCircle, ShieldCheck, BarChart3, CalendarClock } from "lucide-react";
import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE } from "../config/brand";

const platformLogos = [
  {
    name: "Instagram",
    logo: "https://img.icons8.com/color/512/instagram-new--v1.png",
    size: "w-36 md:w-44",
    pos: "top-8 left-10 md:left-14",
    z: "z-30",
  },
  {
    name: "Facebook",
    logo: "https://img.icons8.com/color/512/facebook-new.png",
    size: "w-34 md:w-40",
    pos: "top-24 right-10 md:right-18",
    z: "z-20",
  },
  {
    name: "YouTube",
    logo: "https://img.icons8.com/color/512/youtube-play.png",
    size: "w-40 md:w-52",
    pos: "bottom-8 left-20 md:left-28",
    z: "z-40",
  },
  {
    name: "Twitter",
    logo: "https://img.icons8.com/color/512/twitterx--v2.png",
    size: "w-28 md:w-36",
    pos: "top-44 left-36 md:left-48",
    z: "z-50",
  },
  {
    name: "LinkedIn",
    logo: "https://img.icons8.com/color/512/linkedin.png",
    size: "w-38 md:w-48",
    pos: "bottom-14 right-4 md:right-12",
    z: "z-10",
  },
];

const features = [
  {
    icon: CalendarClock,
    title: "AI Scheduling",
    text: "Auto-pick the best posting windows per platform.",
  },
  {
    icon: BarChart3,
    title: "Unified Analytics",
    text: "Track growth, reach, and engagement in one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Brand Safe Workflow",
    text: "Review, approve, and publish with controlled access.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen overflow-hidden text-slate-900"
      style={{ fontFamily: '"Sora", "Segoe UI", sans-serif' }}
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-sky-100" />
      <div className="absolute -top-40 -left-24 -z-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute -bottom-40 -right-16 -z-10 h-[26rem] w-[26rem] rounded-full bg-cyan-200/40 blur-3xl" />

      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt={BRAND_NAME} className="h-11 w-11 rounded-2xl shadow-lg shadow-blue-200" />
            <div>
              <p className="text-lg font-semibold tracking-tight">{BRAND_NAME}</p>
              <p className="text-xs text-slate-500">{BRAND_TAGLINE}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid h-[calc(100vh-5rem)] w-full max-w-7xl grid-cols-1 gap-8 px-6 py-6 lg:grid-cols-2 lg:items-center">
        <section>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Sparkles className="h-4 w-4" />
            Social Command Center
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Plan. Publish. Grow.
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              All Platforms. One Flow.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
            Manage Instagram, Facebook, YouTube, and LinkedIn from one clean workspace.
            Create content faster, schedule smarter, and see real performance without jumping between tools.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Create Workspace
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <PlayCircle className="h-4 w-4" />
              Go to Login
            </button>
          </div>

          <div className="mt-6 hidden grid-cols-3 gap-3 md:grid">
            {features.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white/90 p-4 shadow-sm">
                <item.icon className="h-5 w-5 text-blue-600" />
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative hidden h-[420px] md:h-[500px] lg:block">
          <div className="absolute left-10 top-16 h-36 w-36 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="absolute right-8 top-10 h-40 w-40 rounded-full bg-blue-200/35 blur-3xl" />
          <div className="absolute right-20 bottom-6 h-44 w-44 rounded-full bg-cyan-200/35 blur-3xl" />

          {platformLogos.map((item) => (
            <img
              key={item.name}
              src={item.logo}
              alt={item.name}
              className={`absolute ${item.pos} ${item.size} ${item.z} select-none object-contain`}
              draggable={false}
            />
          ))}
        </section>
      </main>

      <footer className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-500 flex items-center gap-3">
        <Link to="/terms" className="hover:text-blue-600 hover:underline">Terms</Link>
        <span>•</span>
        <Link to="/privacy" className="hover:text-blue-600 hover:underline">Privacy</Link>
      </footer>
    </div>
  );
}
