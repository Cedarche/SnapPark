import { Bars3Icon, BuildingOffice2Icon } from "@heroicons/react/24/outline";

import { Outlet } from "react-router-dom";
import useWindowDimensions from "@/Reusable/WindowDImensions";

import { OfficeDropdown } from "./DashComponents/Dropdown";
import { Flyout } from "./DashComponents/Flyout";

export default function OutletContainer({
  user,
  teams,
  sOffice,
  updateSelectedOffice,
  setSidebarOpen,
  handleSignOut,
}: any) {
  const { height, width } = useWindowDimensions();

  const computedMaxHeight = width >= 1024 ? height - 64 : null;

  return (
    <div className="lg:pl-72">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="relative flex flex-1 items-center justify ">
            <OfficeDropdown
              officeList={teams}
              sOffice={sOffice}
              updateSelectedOffice={updateSelectedOffice}
            />
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
              <span className="sr-only">View notifications</span>
              <BuildingOffice2Icon
                className="h-6 w-6"
                aria-hidden="true"
                //   onClick={handleParkingSearch}
              />
            </div>

            {/* Separator */}
            <div
              className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
              aria-hidden="true"
            />

            {/* Profile dropdown */}
            <Flyout user={user} handleSignOut={handleSignOut} />
          </div>
        </div>
      </div>

      <main
        className="p-5  bg-gray-100"
        style={
          computedMaxHeight
            ? { minHeight: `${computedMaxHeight}px` }
            : undefined
        }
      >
        <Outlet />
      </main>
    </div>
  );
}
