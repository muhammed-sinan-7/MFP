// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
// import { format } from "date-fns";

// export default function CalendarToolbar({ currentMonth, onPrev, onNext }) {
//   return (
//     <div className="flex justify-between items-center mb-4">
//       <div className="flex gap-2">
//         <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
//           Month
//         </button>
//         <button className="px-4 py-2 text-sm text-gray-500">
//           Week
//         </button>
//       </div>

//       <div className="flex items-center gap-3">
//         <button
//           onClick={onPrev}
//           className="p-2 bg-gray-100 rounded-lg"
//         >
//           <ChevronLeftIcon className="w-4 h-4" />
//         </button>

//         <span className="font-medium">
//           {format(currentMonth, "MMMM yyyy")}
//         </span>

//         <button
//           onClick={onNext}
//           className="p-2 bg-gray-100 rounded-lg"
//         >
//           <ChevronRightIcon className="w-4 h-4" />
//         </button>

//         <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
//           Filters
//         </button>
//       </div>
//     </div>
//   );
// }