import { useState } from "react";
import { Switch } from "@headlessui/react";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { officeSettingsState } from "@/Reusable/RecoilState";
import { useRecoilState } from "recoil";
import CustomSpotListDropdown from "./CustomSpotListDropdown";
import { Transition } from "@headlessui/react";
import Spinner from "@/Reusable/Spinner";
import { updateNotificationSettings } from "@/Reusable/Functions/settingsFunctions";
import "../Home/TableScrollbar.css";

interface NotificationSettings {
  allNotifications: boolean;
  fullNotification: boolean;
  threeSpotsNotification: boolean;
  customMessage: string;
}

interface OfficeData {
  notificationSettings: NotificationSettings;
  parkingSpots: Array<Object>[];
  // Include other properties from office.data as needed
}

interface Office {
  id: string;
  data: OfficeData;
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Notifications = ({ office }) => {
  const [settings, setSettings] = useRecoilState(officeSettingsState);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const {
    notificationSettings: {
      fullNotification,
      threeSpotsNotification,
      allNotifications,
      customSpotsNotification,
      customSpotsArray,
      customMessage,
      spotsRemainingValue,
    },
    mobile, // Assuming you might need these somewhere or they are part of the state
    timezoneOffset,
  } = settings;

  const handleUpdateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        ...newSettings,
      },
    }));
    // Optionally update Firestore
    updateNotificationSettings(office.id, newSettings).catch(console.error);
  };

  const handleChangeSpotsRemaining = (event) => {
    const newValue =
      event.target.value === "" ? "" : Number(event.target.value);
    handleUpdateSettings({ spotsRemainingValue: newValue });
  };

  const handleToggleSwitch = (key) => {
    handleUpdateSettings({ [key]: !settings.notificationSettings[key] });
  };

  const handleRemoveSpot = (spotIndex: number) => {
    const updatedSpotsArray = customSpotsArray.filter(
      (_, index) => index !== spotIndex,
    );
    handleUpdateSettings({ customSpotsArray: updatedSpotsArray });
  };

  const handleUpdateCustomSpotsArray = (updatedArray) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          customSpotsArray: updatedArray,
        },
      };

      // Now call updateNotificationSettings to update Firestore
      updateNotificationSettings(office.id, {
        customSpotsArray: updatedArray,
      }).catch(console.error);

      return newSettings;
    });
  };

  const handleUpdateCustomMessage = (newMessage) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          customMessage: newMessage,
        },
      };

      // Optionally update Firestore
      updateNotificationSettings(office.id, {
        customMessage: newMessage,
      }).catch(console.error);

      return newSettings;
    });
  };

  if (!settings) {
    return <Spinner />;
  }

  return (
    <div className="lg:border p-5 rounded-b-lg shadow-sm sm:-mx-[1px] bg-white hide-scrollbars">
      <div className="px-0 md:px-0 mt-0 sm:px-0">
        <h2 className="text-2xl font-bold leading-7 text-black sm:truncate sm:text-xl sm:tracking-normal">
          Notifications
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Change how often notifications are sent out.
        </p>
      </div>
      {/* All Spots Notification */}
      <Switch.Group as="div" className="flex items-center justify-between mt-5">
        <span className="flex flex-grow flex-col">
          <Switch.Label
            as="span"
            className="text-sm font-medium leading-6 text-gray-900"
            passive
          >
            Parking Full Notification
          </Switch.Label>
          <Switch.Description as="span" className="text-sm text-gray-500">
            Sends out a message to all active members of the Notification List.
          </Switch.Description>
        </span>
        <Switch
          checked={fullNotification}
          onChange={() =>
            handleUpdateSettings({ fullNotification: !fullNotification })
          }
          className={classNames(
            fullNotification ? "bg-indigo-600" : "bg-gray-200",
            "ml-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              fullNotification ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </Switch>
      </Switch.Group>
      {/* Spots Left Notification */}
      <Switch.Group as="div" className="mt-5 flex items-center justify-between">
        <span className="flex flex-grow flex-col">
          <Switch.Label
            as="span"
            className="text-sm font-medium leading-6 text-gray-900"
            passive
          >
            {spotsRemainingValue} Spots Left Notification
          </Switch.Label>
          <Switch.Description
            as="span"
            className="text-sm text-gray-500 inline-flex items-center"
          >
            Notifies all active members of the notification list when there are
            <input
              // type="number"
              name="price"
              id="price"
              maxLength={2}
              className="hidden sm:block max-w-[34px] rounded-md border-0  text-gray-900 ring-1 ring-inset
               ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset
                focus:ring-indigo-600 sm:text-sm sm:leading-0 mx-1"
              placeholder="3"
              value={spotsRemainingValue}
              onChange={handleChangeSpotsRemaining}
              aria-describedby="spots-remaining"
            />{" "}
            <span className="hidden sm:block">Spots remaining.</span>
            {/* Spots remaining. */}
          </Switch.Description>
          <div className="sm:hidden inline-flex items-center mt-1 text-sm text-gray-500">
            <input
              type="number"
              name="price"
              id="price"
              maxLength={2}
              className="block sm:hidden max-w-[34px] rounded-md border-0  text-gray-900 ring-1 ring-inset
               ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset
                focus:ring-indigo-600 sm:text-sm sm:leading-0 mr-1"
              placeholder="3"
              value={spotsRemainingValue}
              onChange={handleChangeSpotsRemaining}
              aria-describedby="spots-remaining"
            />{" "}
            spots remaining.
          </div>
        </span>

        <Switch
          checked={threeSpotsNotification}
          onChange={() => handleToggleSwitch("threeSpotsNotification")}
          className={classNames(
            threeSpotsNotification ? "bg-indigo-600" : "bg-gray-200",
            " ml-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              threeSpotsNotification ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </Switch>
        <div className="relative mt-2 rounded-md shadow-sm"></div>
      </Switch.Group>
      {/* Custom Spots Left Notification */}
      <Switch.Group
        as="div"
        className="flex flex-row sm:flex-row items-center justify-between mt-5"
      >
        <span className="flex flex-grow flex-col w-full">
          <Switch.Label
            as="span"
            className="text-sm font-medium inline-flex items-center leading-6 text-gray-900"
            passive
          >
            Specific Spots Notification{" "}
            <div
              className="ml-2 relative"
              onMouseEnter={() => setIsTooltipVisible(true)}
              onMouseLeave={() => setIsTooltipVisible(false)}
            >
              <InformationCircleIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
              <Transition
                show={isTooltipVisible}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute -top-24 left-5 w-32 max-h-24 p-2 bg-gray-100 text-gray-600 text-sm font-light rounded-lg shadow-md">
                  A message will only be sent out when all custom spots are
                  taken.
                </div>
              </Transition>
            </div>
          </Switch.Label>

          <Switch.Description as="span" className="text-sm text-gray-500">
            Send out a message when specific spots are taken. E.g. Visitors
          </Switch.Description>
          {customSpotsNotification && (
            <div className="mt-1 inline-col sm:inline-flex">
              <CustomSpotListDropdown
                spots={office.data?.parkingSpots}
                customSpotsArray={
                  settings.notificationSettings.customSpotsArray
                }
                setCustomSpotsArray={handleUpdateCustomSpotsArray}
              />
              <div className="inline-flex mt-1 sm:mt-0 sm:ml-4">
                {customSpotsArray.map((spot: any, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center rounded-md  bg-green-100 px-2 py-1.5 text-xs font-medium text-gray-600 ${index !== 0 ? "ml-2" : ""}`}
                  >
                    {spot}
                    <button
                      onClick={() => handleRemoveSpot(index)}
                      className="ml-2 w-4 h-4"
                    >
                      <XMarkIcon className="w-4 h-4 " />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </span>
        <Switch
          checked={customSpotsNotification}
          onChange={() => handleToggleSwitch("customSpotsNotification")}
          className={classNames(
            customSpotsNotification ? "bg-indigo-600" : "bg-gray-200",
            " ml-2 mb-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              customSpotsNotification ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </Switch>
        {/* All Notifications */}
      </Switch.Group>
      {customSpotsNotification && (
        <div className="mt-2">
          <label
            htmlFor="comment"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Set custom message (optional):
          </label>
          <div className="mt-1">
            <textarea
              rows={4}
              name="customMessage"
              id="customMessage"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              //               defaultValue={`${office.data.company} - The following Parking spots in the ${office.data.office} office are now taken:
              //               ${customSpotsArray.map((spot) => `• ${spot}`).join("\n")}
              // See ${office.data.shortURL} for available parks.
              //               `}
              placeholder="E.g. The Downtown office visitor parks are full"
              defaultValue={settings.notificationSettings.customMessage}
              onBlur={(event) => handleUpdateCustomMessage(event.target.value)}
            />
          </div>
        </div>
      )}

      <Switch.Group as="div" className="mt-5 flex items-center justify-between">
        <span className="flex flex-grow flex-col">
          <Switch.Label
            as="span"
            className="text-sm font-medium leading-6 text-gray-900"
            passive
          >
            Notify for all spots
          </Switch.Label>
          <Switch.Description as="span" className="text-sm text-gray-500">
            Sends out a separate message every time a parking spot is taken,
            with a list of the remaining spots.
          </Switch.Description>
        </span>
        <Switch
          checked={allNotifications}
          onChange={() => handleToggleSwitch("allNotifications")}
          className={classNames(
            allNotifications ? "bg-indigo-600" : "bg-gray-200",
            "ml-2 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          )}
        >
          <span
            aria-hidden="true"
            className={classNames(
              allNotifications ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          />
        </Switch>
      </Switch.Group>
    </div>
  );
};

export default Notifications;
