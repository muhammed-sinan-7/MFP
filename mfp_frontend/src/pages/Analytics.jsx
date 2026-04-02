import React, { useState } from "react";
import { Instagram, Linkedin, Youtube } from "lucide-react";

import { useAnalytics } from "../hooks/useAnalytics";
import { useInstagramAnalytics } from "../hooks/useInstagramAnalytics";
import { useLinkedinAnalytics } from "../hooks/useLinkedinAnalytics";
import { useYoutubeAnalytics } from "../hooks/useYoutubeAnalytics";

import Overview from "../components/analytics/Overview";
import InstagramAnalytics from "../components/analytics/Instagram";
import LinkedInAnalytics from "../components/analytics/Linkedin";
import YouTubeAnalytics from "../components/analytics/Youtube";


/* ---------------- TAB DATA LOADERS ---------------- */

const OverviewTab = () => {
  const overviewData = useAnalytics();

  return (
    <Overview
      overview={overviewData.overview}
      chartData={overviewData.chartData}
      engagementDistribution={overviewData.engagementDistribution}
      recentPosts={overviewData.recentPosts}
      onRefresh={overviewData.refetch}
    />
  );
};

const InstagramTab = () => {
  const instagramData = useInstagramAnalytics();

  return (
    <InstagramAnalytics
      overview={instagramData.overview}
      growth={instagramData.growth}
      topPosts={instagramData.topPosts}
      performance={instagramData.performance}
      onRefresh={instagramData.refetch}
    />
  );
};

const LinkedinTab = () => {
  const linkedinData = useLinkedinAnalytics();

  return (
    <LinkedInAnalytics
      overview={linkedinData.overview}
      growth={linkedinData.growth}
      posts={linkedinData.posts}
      onRefresh={linkedinData.refetch}
    />
  );
};

const YoutubeTab = () => {
  const youtubeData = useYoutubeAnalytics();

  return (
    <YouTubeAnalytics
      overview={youtubeData.overview}
      growth={youtubeData.growth}
      videos={youtubeData.videos}
      trafficSources={youtubeData.trafficSources}
      onRefresh={youtubeData.refetch}
    />
  );
};



const Analytics = () => {

  const [platform, setPlatform] = useState("overview");

  return (
    <div className="w-full font-sans text-gray-900">

      {/* Navigation Tabs */}
      <header className="mb-6">
        <nav className="mx-auto flex w-full max-w-fit items-center bg-gray-50 rounded-xl p-1 border border-gray-100 overflow-x-auto">
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

      <main className="space-y-8">

        {platform === "overview" && <OverviewTab />}

        {platform === "instagram" && <InstagramTab />}

        {platform === "linkedin" && <LinkedinTab />}

        {platform === "youtube" && <YoutubeTab />}

      </main>
    </div>
  );
};

export default Analytics;
