import { Fragment } from "react";
import {  Menu, Transition, Popover } from "@headlessui/react";

import {
  ChevronDownIcon,

} from "@heroicons/react/20/solid";

function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

export function OfficeDropdown({ officeList, sOffice, updateSelectedOffice }: any) {
    return (
      <div className="hidden md:inline-flex rounded-md shadow-sm bg-slate-100">
        <div className=" text-sm font-semibold flex items-center px-5 bg-slate-100 rounded-lg">
          Office:
        </div>
        <button
          type="button"
          className={`relative inline-flex items-center ${officeList.length > 1 ? "rounded-l-md" : "rounded-md"} bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1
    ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10`}
        >
          {sOffice.name ? sOffice.name : "Loading..."}
        </button>
        {officeList.length > 1 && (
          <Menu as="div" className="relative -ml-px block">
            <Menu.Button className="relative inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10">
              <span className="sr-only">Open options</span>
              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {officeList.map((item: any) => (
                    <Menu.Item key={item.id}>
                      {({ active }) => (
                        <div
                          onClick={() => updateSelectedOffice(item.id)}
                          className={classNames(
                            active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm cursor-pointer",
                          )}
                        >
                          {item.name}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
    );
  }