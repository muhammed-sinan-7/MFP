import React, { useMemo, useState } from "react";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { socialList } from "../services/accountService";

import { useAnalytics } from "../hooks/useAnalytics";
import { useInstagramAnalytics } from "../hooks/useInstagramAnalytics";
import { useLinkedinAnalytics } from "../hooks/useLinkedinAnalytics";
import { useYoutubeAnalytics } from "../hooks/useYoutubeAnalytics";

import Overview from "../components/analytics/Overview";
import InstagramAnalytics from "../components/analytics/Instagram";
import LinkedInAnalytics from "../components/analytics/Linkedin";
import YouTubeAnalytics from "../components/analytics/Youtube";


/* ---------------- TAB DATA LOADERS ---------------- */

const OverviewTab = ({ connectedPlatforms }) => {
  const overviewData = useAnalytics();

  return (
    <Overview
      overview={overviewData.overview}
      chartData={overviewData.chartData}
      engagementDistribution={overviewData.engagementDistribution}
      recentPosts={overviewData.recentPosts}
      onRefresh={overviewData.refetch}
      connectedPlatforms={connectedPlatforms}
    />
  );
};

const InstagramTab = ({ isConnected }) => {
  const instagramData = useInstagramAnalytics();

  return (
    <InstagramAnalytics
      overview={instagramData.overview}
      growth={instagramData.growth}
      topPosts={instagramData.topPosts}
      performance={instagramData.performance}
      onRefresh={instagramData.refetch}
      isConnected={isConnected}
    />
  );
};

const LinkedinTab = ({ isConnected }) => {
  const linkedinData = useLinkedinAnalytics();

  return (
    <LinkedInAnalytics
      overview={linkedinData.overview}
      growth={linkedinData.growth}
      posts={linkedinData.posts}
      onRefresh={linkedinData.refetch}
      isConnected={isConnected}
      analyticsApproved={false}
    />
  );
};

const YoutubeTab = ({ isConnected }) => {
  const youtubeData = useYoutubeAnalytics();

  return (
    <YouTubeAnalytics
      overview={youtubeData.overview}
      growth={youtubeData.growth}
      videos={youtubeData.videos}
      trafficSources={youtubeData.trafficSources}
      onRefresh={youtubeData.refetch}
      isConnected={isConnected}
    />
  );
};



const Analytics = () => {

  const [platform, setPlatform] = useState("overview");
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  React.useEffect(() => {
    let mounted = true;

    async function loadConnections() {
      try {
        const response = await socialList();
        const accounts = response?.data || [];
        const providers = new Set();

        accounts.forEach((account) => {
          (account.publishing_targets || []).forEach((target) => {
            if (target?.provider) {
              providers.add(String(target.provider).toLowerCase());
            }
          });
        });

        if (mounted) {
          setConnectedPlatforms(Array.from(providers));
        }
      } catch (error) {
        if (mounted) {
          setConnectedPlatforms([]);
        }
      }
    }

    loadConnections();

    return () => {
      mounted = false;
    };
  }, []);

  const connectedPlatformSet = useMemo(
    () => new Set((connectedPlatforms || []).map((provider) => provider.toLowerCase())),
    [connectedPlatforms],
  );

  return (
    <div className="w-full font-sans text-gray-900">

      {/* Navigation Tabs */}
      <header className="mb-6">
        <nav className="flex w-full items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1 overflow-x-auto">
          {["overview", "instagram", "linkedin", "youtube"].map((tab) => (
            <button
              key={tab}
              onClick={() => setPlatform(tab)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 capitalize whitespace-nowrap ${
                platform === tab
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "instagram" && <Instagram size={14} />}
              {tab === "linkedin" && <Linkedin size={14} />}
              {tab === "youtube" && <Youtube size={14} />}
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="space-y-6 sm:space-y-8">

        {platform === "overview" && (
          <OverviewTab connectedPlatforms={connectedPlatforms} />
        )}

        {platform === "instagram" && (
          <InstagramTab isConnected={connectedPlatformSet.has("instagram")} />
        )}

        {platform === "linkedin" && (
          <LinkedinTab isConnected={connectedPlatformSet.has("linkedin")} />
        )}

        {platform === "youtube" && (
          <YoutubeTab isConnected={connectedPlatformSet.has("youtube")} />
        )}

      </main>
    </div>
  );
};

export default Analytics;
