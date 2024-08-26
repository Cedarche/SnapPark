import React, { useEffect, useState } from "react";
import ProfileInfo from "./SettingsProfileInfo";
import Notifications from "./SettingsNotifications";
import OfficeSettings from "./OfficeSettings";
import { useParams } from "react-router-dom";
import "../Home/TableScrollbar.css"

const tabs = [
  { name: "Account", href: "#", component: ProfileInfo, current: true },
  {
    name: "Office Settings",
    href: "#",
    component: OfficeSettings,
    current: false,
  },
  // { name: 'Notifications', href: '#', component: Notifications },
  // { name: 'Billing', href: '#', current: false },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Settings() {
  const [currentTab, setCurrentTab] = useState(
    tabs.find((tab) => tab.current) || tabs[0],
  );

  const params = useParams<{
    officeSettings: string;
  }>();
  const { officeSettings } = params;

  const handleTabClick = (tab: any) => {
    setCurrentTab(tab);
  };

  useEffect(() => {
    // Check if the officeSettings parameter is present
    if (officeSettings) {
      // Set the currentTab to the Office Settings tab
      const officeSettingsTab = tabs.find(
        (tab) => tab.name === "Office Settings",
      );
      if (officeSettingsTab) {
        setCurrentTab(officeSettingsTab);
      }
    }
  }, [officeSettings]);

  const CurrentComponent = currentTab.component;

  return (
    <div className="mx-auto  max-w-6xl px-0 sm:px-6 lg:px-8 hide-scrollbars">
      <div className="sm:hidden sm:ring-1 ring-gray-900/20">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          value={currentTab.name}
          onChange={(e) => {
            const tab = tabs.find((tab) => tab.name === e.target.value);
            handleTabClick(tab);
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block ring-1 ring-gray-900/20 rounded-t-lg">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-t-lg shadow overflow-hidden"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <a
              key={tab.name}
              href={tab.href}
              className={classNames(
                tab === currentTab
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700",
                "group relative min-w-0 flex-1 overflow bg-white py-4 px-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10",
              )}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick(tab);
              }}
              aria-current={tab === currentTab ? "page" : undefined}
            >
              <span>{tab.name}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  tab === currentTab ? "bg-indigo-500" : "bg-transparent",
                  "absolute inset-x-0 bottom-0 h-0.5",
                )}
              />
            </a>
          ))}
        </nav>
      </div>

      <CurrentComponent />
    </div>
  );
}
