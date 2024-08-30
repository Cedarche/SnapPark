import { Fragment, useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogPanel,
  Menu,
  Transition,
  TransitionChild,
  Popover,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import { NavLink } from "react-router-dom";

import SnapParkLogo from "../../assets/SnapParkLogo-01.png";

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function MobileSidebar({
  userData,
  sidebarOpen,
  setSidebarOpen,
  teams,
  navigation,
  updateSelectedOffice,
}: any) {
  return (
    <Transition show={sidebarOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50 lg:hidden "
        onClose={setSidebarOpen}
      >
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div className="fixed inset-0 flex">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar*/}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <img
                    className="h-6 w-auto"
                    src={SnapParkLogo}
                    alt="Snap Park Logo"
                  />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <div className="text-xs font-semibold leading-6 text-gray-400">
                        Locations
                      </div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {teams.map((team: any) => (
                          <li key={team.name}>
                            <a
                              // href={team.href}
                              onClick={() => updateSelectedOffice(team.id)}
                              className={classNames(
                                team.current
                                  ? "bg-gray-50 text-indigo-600"
                                  : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold hover:cursor-pointer",
                              )}
                            >
                              <span
                                className={classNames(
                                  team.current
                                    ? "text-indigo-600 border-indigo-600"
                                    : "text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600",
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white",
                                )}
                              >
                                {team.initial}
                              </span>
                              <span className="truncate">{team.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item: any) => (
                          <li key={item.name}>
                            {userData?.data.profileComplete ? (
                              <NavLink
                                to={item.href}
                                onClick={() => setSidebarOpen(false)} // Adding the onClick handler here
                                className={({ isActive }) => {
                                  const isDashboardActive =
                                    item.name === "Dashboard"
                                      ? location.pathname === "/dashboard"
                                      : isActive;

                                  const linkClassNames = classNames(
                                    isDashboardActive
                                      ? "bg-gray-50 text-indigo-600"
                                      : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                  );

                                  return linkClassNames;
                                }}
                              >
                                <item.icon
                                  className={classNames(
                                    location.pathname === item.href
                                      ? "text-indigo-600"
                                      : "text-gray-400 group-hover:text-indigo-600",
                                    "h-6 w-6 shrink-0",
                                  )}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </NavLink>
                            ) : (
                              <div
                                className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-400 cursor-not-allowed"
                                title="Complete your profile to enable this link"
                              >
                                <item.icon
                                  className="h-6 w-6 shrink-0 text-gray-400"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
