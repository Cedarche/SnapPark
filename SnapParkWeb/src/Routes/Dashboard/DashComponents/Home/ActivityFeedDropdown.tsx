import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function ActivityFeedDropdown({
  dates,
  onSelectDate,
}: {
  dates: string[];
  onSelectDate: (date: string) => void;
}) {
  // Get the current date in the same format as your dates array
  const currentDate = new Date().toLocaleDateString();

  // Filter out the current date from the dates array
  const filteredDates = dates.filter(date => date !== currentDate)

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none max-h-[240px] overflow-auto">
          <div className="py-1">
            {/* "Today's Activity" button to reset the activity feed to the current date */}
            <button
              type="button"
              className="block w-full px-4 py-2 text-left text-sm font-bold hover:bg-gray-100"
              onClick={() => onSelectDate(currentDate)}
            >
              Today's Activity
            </button>
            {filteredDates.map((date) => (
              <Menu.Item key={date}>
                {({ active }) => (
                  <button
                    type="button"
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block w-full px-4 py-2 text-left text-sm",
                    )}
                    onClick={() => onSelectDate(date)}
                  >
                    {date}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
