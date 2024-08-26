import { Fragment } from "react";
import { Transition, Popover } from "@headlessui/react";
import {
  ArrowRightEndOnRectangleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export function Flyout({ user, handleSignOut }: any) {
  return (
    <Popover className="relative">
      <Popover.Button
        className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6
         text-gray-900"
      >
        <span> {user ? user?.displayName : "Undefined"}</span>
        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
      </Popover.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="absolute  z-10 mt-5 flex w-screen max-w-max -right-10 top-8 px-4">
          <div className="w-screen max-w-[22rem] flex-auto overflow-hidden rounded-2xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
            <div className="p-4">
              {resources.map((item) => (
                <div
                  key={item.name}
                  className="group relative flex gap-x-4 rounded-lg p-2 hover:bg-gray-50"
                >
                  <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                    <item.icon
                      className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <a href={item.href} className="font-semibold text-gray-900">
                      {item.name}
                      <span className="absolute inset-0" />
                    </a>
                    <p className="mt-1 text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-4">
              <div className="flex justify-between">
                <h3 className="text-sm font-semibold leading-6 text-gray-500">
                  Policies
                </h3>
              </div>
              <ul role="list" className="mt-2 space-y-0">
                {recentPosts.map((post) => (
                  <li
                    key={post.id}
                    className="relative px-2 py-1 rounded-md hover:bg-slate-100"
                  >
                    <time
                      dateTime={post.datetime}
                      className="block text-xs leading-6 text-gray-600"
                    >
                      {post.date}
                    </time>
                    <a
                      href={post.href}
                      className="block truncate text-sm font-semibold leading-6 text-gray-900"
                      target="_blank" // Opens in a new tab
                      rel="noopener noreferrer" // Security measure
                    >
                      {post.title}
                      <span className="absolute inset-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full flex items-center justify-end p-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign Out
                <ArrowRightEndOnRectangleIcon
                  className="-mr-0.5 h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}

const resources = [
  {
    name: "Contact",
    description: "Get all of your questions answered",
    href: "/contact",
    icon: ChatBubbleLeftRightIcon,
  },
  // {
  //   name: "Guide",
  //   description: `Learn how to use ${appName.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())}`,
  //   href: "#",
  //   icon: BookmarkSquareIcon,
  // },
  // {
  //   name: "Events",
  //   description: "See meet-ups and other events near you",
  //   href: "#",
  //   icon: CalendarDaysIcon,
  // },
];
const recentPosts = [
  {
    id: 1,
    title: "Privacy Policy",
    href: "/privacy-policy",
    date: "Mar 5, 2023",
    datetime: "2023-03-05",
  },
  {
    id: 2,
    title: "Terms and Conditions",
    href: "/terms-and-conditions",
    date: "Feb 25, 2023",
    datetime: "2023-02-25",
  },
];
