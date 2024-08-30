import { NavLink } from "react-router-dom";

import SnapParkLogo from "../../assets/SnapParkLogo-01.png";
import { companyName } from "@/Reusable/constants";

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function StaticSidebar({
  userData,
  teams,
  navigation,
  updateSelectedOffice,
}: any) {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <img className="h-6 w-auto" src={SnapParkLogo} alt="Snap Park Logo" />
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

            <li className="mt-auto">
              <div
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-xs font-light
                   leading-6 text-gray-400 hover:bg-gray-50 hover:text-indigo-600"
              >
                {companyName} - v0.01
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
