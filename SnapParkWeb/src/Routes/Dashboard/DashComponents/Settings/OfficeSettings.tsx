import { Fragment, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  PlusCircleIcon,
  CircleStackIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { updateOfficeSettings } from "@/Reusable/Functions/settingsFunctions";

import Notifications from "./SettingsNotifications";
import { useRecoilState } from "recoil";
import {
  userState,
  selectedOffice,
  officeSettingsState,
} from "@/Reusable/RecoilState";
import AddOfficeModal from "./AddOfficeModal";
import Spinner from "@/Reusable/Spinner";
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const teamsArray = [{ id: 1, name: "", href: "#", initial: "", current: true }];

export default function OfficeSettings() {
  const [userData] = useRecoilState(userState);
  const [sOffice, setSelectedOffice] = useRecoilState<any>(selectedOffice);
  const [settings] = useRecoilState(officeSettingsState);
  const [loading, setLoading] = useState(false);
  // const [teams, setTeams] = useState(teamsArray);
  const [edit, setEdit] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [mobile, setMobile] = useState<number>();
  const [timezoneOffset, setTimezoneOffset] = useState<number>();
  const [officeName, setOfficeName] = useState<string>();

  const [openAddOfficeModal, setOpenAddOfficeModal] = useState(false);

  useEffect(() => {
    if (settings) {
      // console.log('Office Settings: ', settings)
      setMobile(settings.mobile);
      setTimezoneOffset(settings.timezoneOffset);
      setOfficeName(settings.officeName);
    }
  }, [settings]);

  if (!userData) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const handleSave = async () => {
    if (sOffice.id && (mobile || timezoneOffset || officeName)) {
      setLoading(true);
      // console.log(sOffice.id)
      // console.log(mobile)
      // console.log(timezoneOffset)
      try {
        await updateOfficeSettings(sOffice.id, mobile, timezoneOffset, officeName);
        setEdit(false);
        setLoading(false);
      } catch (e) {
        console.log("Something went wrong: ", e);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <AddOfficeModal
        open={openAddOfficeModal}
        setOpen={setOpenAddOfficeModal}
      />
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-1 xl:gap-x-8 sm:ring-1 sm:ring-gray-900/20  sm:bg-white py-4 md:px-4  rounded-b-lg ">
        <div
          key={sOffice.id}
          className=" rounded-xl border border-gray-200 bg-white"
        >
          <div className=" rounded-xl flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
            <BuildingOfficeIcon className="p-2 h-10 w-10 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10" />

            <h2 className="text-2xl font-bold leading-7 text-black sm:truncate sm:text-2xl sm:tracking-normal">
              {edit ? (
                <div className="mt-2">
                  <input
                    type="text"
                    name="office"
                    id="office"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={officeName}
                    onChange={(e) => setOfficeName(e.target.value)}
                  />
                </div>
              ) : (
                officeName
              )}
            </h2>
            <Menu
              as="div"
              className="relative ml-auto inline-flex items-center "
            >
              <div className="inline-flex gap-x-1.5 ">
                {edit && (
                  <div className="inline-flex gap-x-1.5">
                    <button
                      type="button"
                      onClick={() => setEdit(false)}
                      className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Save{" "}
                    </button>
                  </div>
                )}
                <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Open options</span>
                  <EllipsisHorizontalIcon
                    className="h-5 w-5 "
                    aria-hidden="true"
                  />
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
                <Menu.Items className="absolute right-0 top-4 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onClick={() => setEdit(true)}
                        className={classNames(
                          active ? "bg-gray-50" : "",
                          "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer",
                        )}
                      >
                        Edit
                        <span className="sr-only">
                          , {sOffice.data?.office}
                        </span>
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        // href="#"
                        className={classNames(
                          active ? "bg-gray-50" : "",
                          "block px-3 py-1 text-sm leading-6 text-red-500 cursor-pointer",
                        )}
                      >
                        Delete
                        <span className="sr-only">
                          , {sOffice.data?.office}
                        </span>
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Status</dt>
              {sOffice.data?.active ? (
                <span className="inline-flex items-center gap-x-1.5 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                  <svg
                    className="h-1.5 w-1.5 fill-green-500"
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                  >
                    <circle cx={3} cy={3} r={3} />
                  </svg>
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-x-1.5 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  <svg
                    className="h-1.5 w-1.5 fill-red-500"
                    viewBox="0 0 6 6"
                    aria-hidden="true"
                  >
                    <circle cx={3} cy={3} r={3} />
                  </svg>
                  Inactive
                </span>
              )}
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Country</dt>
              <dd className="text-gray-700">
                <div className="font-medium text-gray-900">
                  {sOffice.data?.country}
                </div>
              </dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">
                Timezone{" "}
                <span
                  onClick={() => setEdit(!edit)}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-blue-600 ml-2 cursor-pointer hover:bg-indigo-100"
                >
                  Change
                </span>
              </dt>

              <dd className="text-gray-700 inline-flex items-center">
                {edit ? (
                  <div>
                    {" "}
                    <div className=" flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 -my-1 border-gray-300 px-3 text-gray-500 sm:text-sm">
                        GMT
                      </span>
                      <input
                        type="number"
                        min="-11"
                        max="11"
                        maxLength={2}
                        defaultValue={sOffice.data?.countryInfo.timezoneOffset}
                        value={timezoneOffset}
                        onChange={(e) =>
                          setTimezoneOffset(Number(e.target.value))
                        }
                        name="timeZoneOffset"
                        id="timeZoneOffset"
                        className="block w-[85px] pr-1.5 rounded-none rounded-r-md border-0 py-1 -my-1 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm "
                        placeholder="+ 0:00"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-gray-900">
                    GMT {timezoneOffset >= 0 && "+"}
                    {timezoneOffset}:00
                  </div>
                )}

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
                    <div className="absolute -top-[100px] right-[10px] w-[240px] max-h-24 p-2 bg-gray-100 text-gray-600 text-sm font-light rounded-lg shadow-md">
                      Parkings spots revert to available at midnight. This value
                      determines in which timezone this office will reset.
                    </div>
                  </Transition>
                </div>
              </dd>
            </div>

            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">
                Contact Number{" "}
                <span
                  onClick={() => setEdit(!edit)}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-blue-600 ml-2 cursor-pointer hover:bg-indigo-100"
                >
                  Change
                </span>
              </dt>
              <dd className="text-gray-700">
                {edit ? (
                  <div>
                    {" "}
                    <div className=" flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 -my-1 border-gray-300 px-3 text-gray-500 sm:text-sm">
                        +61
                      </span>
                      <input
                        type="number"
                        name="mobile"
                        id="mobile"
                        value={mobile}
                        onChange={(e) => setMobile(Number(e.target.value))}
                        className="block w-[120px] pr-1.5 rounded-none rounded-r-md border-0 py-1 -my-1 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0400 111 222"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="font-medium text-gray-900">{mobile}</div>
                )}
              </dd>
            </div>
          </dl>
          <dl>
            <Notifications office={sOffice} />
          </dl>
        </div>
        <div className="w-full inline-flex justify-end">
          <button
            type="button"
            onClick={() => setOpenAddOfficeModal(true)}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusCircleIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Office
          </button>
        </div>
      </div>
    </>
  );
}
