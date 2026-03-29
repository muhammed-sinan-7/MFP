import { ChevronRight } from "lucide-react";

const ArticleCard = ({ category, title, summary, date, image }) => (
  <div className="flex flex-col group cursor-pointer">

    <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-video mb-5 relative">
      <img
        src={image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c"}
        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        alt={title}
      />

      <span className="absolute top-3 left-3 bg-blue-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
        {category}
      </span>
    </div>

    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">
      {date} • 5 MIN READ
    </p>

    <h3 className="font-bold text-xl leading-snug mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
      {title}
    </h3>

    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
      {summary || "A deep dive into the latest trends shaping the industry."}
    </p>

    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img
          src="https://avatar.iran.liara.run/public/job/designer/2"
          className="w-6 h-6 rounded-full"
          alt="avatar"
        />
        <span className="text-[11px] font-bold text-gray-600 uppercase">
          Marcus Thorne
        </span>
      </div>

      <ChevronRight
        size={16}
        className="text-gray-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1"
      />
    </div>

  </div>
);

export default ArticleCard;