import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import { Link } from "react-router-dom";
import { ToolTipProps } from "./Types/types";

export default function ToolTip({
  isTooltipVisible,
  setIsTooltipVisible,
  text,
  link,
}: ToolTipProps) {
  return (
    <div
      className="ml-2 relative z-50"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      <InformationCircleIcon className="h-5 w-5 mt-1 text-gray-400 cursor-pointer" />
      <Transition
        show={isTooltipVisible}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="absolute z-50 top-8 sm:top-5 -left-28 sm:left-5 w-64 max-h-24 p-2 bg-gray-100 text-gray-600 text-sm font-light rounded-lg shadow-md">
          {text}
          {link && (
            <div className="mt-2">
              <Link to={link} className="text-indigo-500 underline">
                Learn more
              </Link>
            </div>
          )}
        </div>
      </Transition>
    </div>
  );
}
