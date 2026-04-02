import {
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
  FaFacebook
} from "react-icons/fa";

const providerIcons = {
  instagram: <FaInstagram className="text-pink-500 text-xl" />,
  linkedin: <FaLinkedin className="text-blue-600 text-xl" />,
  youtube: <FaYoutube className="text-red-600 text-xl" />,
  twitter: <FaTwitter className="text-sky-500 text-xl" />,
  meta: <FaFacebook className="text-sky-500 text-xl" />,
};

export default function PlatformSidebar({
  targets,
  selectedTargets,
  activeTarget,
  onSelect,
}) {

  return (
    <div className="bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex w-full lg:w-[70px] lg:hover:w-[220px] lg:transition-all lg:duration-300 flex-row lg:flex-col overflow-x-auto lg:overflow-visible">

      {targets.map((target) => {

        const active = activeTarget?.id === target.id;

        return (
          <button
            key={target.id}
            onClick={() => onSelect(target)}
            className={`flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-3 lg:py-4 transition min-w-max lg:min-w-0
            ${active ? "bg-gray-100" : "hover:bg-gray-50"}`}
          >

         
            <div className="w-8 h-6 flex items-center justify-center">
              {providerIcons[target.provider]}
            </div>

           
            <div className="text-left opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">

              <div className="text-sm font-semibold capitalize">
                {target.provider}
              </div>

              <div className="text-xs text-gray-500">
                {target.display_name}
              </div>

            </div>

          </button>
        );
      })}
    </div>
  );
}
