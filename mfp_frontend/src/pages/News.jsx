import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getNews } from "../services/newsService";
import ArticleCard from "../components/news/ArticleCard";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Drawer state
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Fetch news
  const loadNews = async (pageNumber) => {
    try {
      setLoading(true);
      const res = await getNews(pageNumber);
      // console.log(res.data)
      setNews((prev) => [...prev, ...(res.data.results || [])]);
    } catch (err) {
      console.error("Failed to load news", err);
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => {
    loadNews(1);
  }, []);

  // Load more button
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNews(nextPage);
  };

  // Split data
  const featuredPost = news[0];
  const gridPosts = news.slice(1);

  if (loading && news.length === 0)
    return <div className="p-8 text-gray-400">Loading discovery feed...</div>;

  return (
    <div className="w-full font-sans text-slate-900 bg-gray-50/40">
      <main className="w-full">
        <section>
          <h1 className="text-2xl font-semibold mb-2">Discovery Feed</h1>
          <p className="text-gray-600 mb-10 md:mb-12 text-lg">
            Curated insights from the world of tech and design.
          </p>

          {/* FEATURED ARTICLE */}
          {featuredPost && (
            <div
              className="mb-16 group cursor-pointer"
              onClick={() => setSelectedArticle(featuredPost)}
            >
              <div className="relative overflow-hidden rounded-3xl mb-6 shadow-xl">
                <img
                  src={
                    featuredPost.image ||
                    "https://images.unsplash.com/photo-1497366216548-37526070297c"
                  }
                  className="w-full h-[380px] md:h-[460px] lg:h-[520px] object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={featuredPost.title}
                />
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight group-hover:text-blue-700 transition-colors">
                {featuredPost.title}
              </h2>

              <p className="text-gray-600 text-lg md:text-xl line-clamp-3">
                {featuredPost.summary}
              </p>
            </div>
          )}

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {gridPosts.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                onClick={() => setSelectedArticle(item)}
                className="cursor-pointer"
              >
                <ArticleCard
                  category={item.source}
                  title={item.title}
                  summary={item.summary}
                  date={new Date(item.published_at).toLocaleDateString()}
                  image={item.image}
                />
              </div>
            ))}
          </div>

          {/* LOAD MORE */}
          <div className="flex justify-center mt-16 md:mt-20">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Load More Articles"}
            </button>
          </div>
        </section>
      </main>

      {/* ── Modern Drawer ─────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${
          selectedArticle ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSelectedArticle(null)}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${
            selectedArticle ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer panel – slides from right */}
        <div
          className={`absolute top-0 bottom-0 right-0 w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-white shadow-2xl transform transition-transform duration-500 ease-out ${
            selectedArticle ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Article</h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-6 shadow-md">
                <img
                  src={
                    selectedArticle?.image ||
                    "https://images.unsplash.com/photo-1497366216548-37526070297c"
                  }
                  className="w-full h-64 object-cover"
                  alt=""
                />
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 leading-tight">
                {selectedArticle?.title}
              </h2>

              {/* Summary */}
              <p className="text-gray-700 leading-relaxed text-[15.5px] whitespace-pre-line">
                {selectedArticle?.ai_summary || selectedArticle?.summary}
              </p>
            </div>

            {/* Footer / CTA */}
            <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/70">
              <a
                href={selectedArticle?.url}lg
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-"
              >
                Read Original Article →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
