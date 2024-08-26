import { Fragment, useEffect, useState, useMemo } from "react";
import { Dialog, Menu, Transition, Popover } from "@headlessui/react";
import {
  Bars3Icon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  ChartBarSquareIcon,
  XMarkIcon,
  CreditCardIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import useWindowDimensions from "@/Reusable/WindowDImensions";
import SnapParkLogo from "../../assets/SnapParkLogo-01.png";
import { companyName } from "@/Reusable/constants";
import { useOfficeSettings } from "@/Reusable/Hooks/useNotificationSettings";
import { useSetOffices } from "@/Reusable/Hooks/useSetOffices";
import { DocumentData } from "firebase/firestore";
import { auth } from "@/firebase";
import { useRecoilState } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import { TrialAlerts, checkTrialStatus } from "./DashComponents/Alerts";
import { Signout } from "@/Reusable/Functions/authFunctions";
import { updateAlternativeParkingList } from "@/Reusable/Functions/authFunctions";
import { OfficeDropdown } from "./DashComponents/Dropdown";
import { Flyout } from "./DashComponents/Flyout";

function classNames(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sOffice, setSelectedOffice] = useRecoilState<any>(selectedOffice);
  const [teams, setTeams] = useState(teamsArray);
  const [alert, setAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [userData, setUserData] = useRecoilState<DocumentData | undefined>(
    userState,
  );
  const navigate = useNavigate();
  const location = useLocation();

  useOfficeSettings(sOffice?.id);
  useSetOffices();

  const user = auth.currentUser;
  const { height, width } = useWindowDimensions();

  const handleParkingSearch = () => {
    if (userData?.data.address) {
      console.log(userData.id);
      console.log(sOffice.id);
      console.log(userData.data.address);

      updateAlternativeParkingList(
        userData.id,
        sOffice.id,
        userData.data.address,
      );
    }
  };

  const options = useMemo(() => {
    // Use optional chaining to safely access clientSecret
    const clientSecret = userData?.data?.subscriptionDetails?.clientSecret;

    if (clientSecret) {
      return { clientSecret };
    }
    return {}; // Return an empty object when clientSecret is not available
  }, [userData]);

  useEffect(() => {
    // console.log('UserData: ', userData)
    if (userData && userData.offices && userData.offices.length > 0) {
      const newTeamsArray = userData.offices.map((officeData: any) => ({
        id: officeData.id,
        name: officeData.data.office,
        href: "#",
        initial: officeData.data.office[0],
        current: false,
        data: officeData.data,
      }));

      // Set the teams state with the new array
      setTeams(newTeamsArray);

      updateSelectedOffice(newTeamsArray[0].id);

      const alertDetails = checkTrialStatus({
        subscriptionStatus: userData?.data?.status,
        createdAt: userData.data.createdAt,
        trialDaysTotal: 30,
        setupStatus: userData.data.setupIntentStatus, // Pass the setupIntentStatus from userData
        trialAlert: userData.data?.trialAlert,
      });
      setTimeout(() => {
        setAlert(alertDetails.showAlert);
        setAlertType(alertDetails.alertType);
      }, 2000);
    }
  }, [userData]);

  const updateSelectedOffice = (selectedTeamId: any) => {
    setTeams((currentTeams) => {
      const updatedTeams = currentTeams.map((team) => ({
        ...team,
        current: team.id === selectedTeamId,
      }));

      // Find the selected office from the updated teams array
      const selectedOffice = updatedTeams.find(
        (team) => team.id === selectedTeamId,
      );

      // Update the sOffice state
      if (selectedOffice) setSelectedOffice(selectedOffice);
      if (sidebarOpen) setSidebarOpen(false);

      return updatedTeams;
    });
  };

  const handleSignOut = async () => {
    try {
      await Signout(); // Sign out the user
      navigate("/"); // Redirect to the home page
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally handle errors here (e.g., display an error message)
    }
  };

  const computedMaxHeight = width >= 1024 ? height - 64 : null;

  return (
    <>
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden "
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
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
                  </Transition.Child>
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
                            {teams.map((team) => (
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
                            {navigation.map((item) => (
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
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
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
                    {teams.map((team) => (
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
                    {navigation.map((item) => (
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
            <div
              className="h-6 w-px bg-gray-200 lg:hidden"
              aria-hidden="true"
            />

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
                    onClick={handleParkingSearch}
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
      </div>
      <TrialAlerts show={alert} setShow={setAlert} alertType={alertType} />
    </>
  );
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: ChartBarSquareIcon,
    current: true,
  },

  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCardIcon,
    current: false,
  },
  // {
  //   name: "Notifications",
  //   href: "/dashboard/notifications",
  //   icon: BellAlertIcon,
  //   current: false,
  // },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Cog6ToothIcon,
    current: false,
  },
  {
    name: "QR Code Stickers",
    href: "/dashboard/stickers",
    icon: QrCodeIcon,
    current: false,
  },
];
const teamsArray = [{ id: 1, name: "", href: "#", initial: "", current: true }];
