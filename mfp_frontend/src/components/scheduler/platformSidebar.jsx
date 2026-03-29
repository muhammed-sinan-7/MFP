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
    <div className="group w-[70px] hover:w-[220px] transition-all duration-300 bg-white border-r border-gray-200 flex flex-col">

      {targets.map((target) => {

        const active = activeTarget?.id === target.id;

        return (
          <button
            key={target.id}
            onClick={() => onSelect(target)}
            className={`flex items-center gap-4 px-4 py-4 transition
            ${active ? "bg-gray-100" : "hover:bg-gray-50"}`}
          >

         
            <div className="w-8 h-6 flex items-center justify-center">
              {providerIcons[target.provider]}
            </div>

           
            <div className="opacity-0 group-hover:opacity-100 transition text-left">

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