import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { appName } from "@/Reusable/constants";
import { Link } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";

const navigation = [
  // { name: "Contact", href: "/contact" },
  { name: "How it works", href: "NotificationSection" },
  { name: "QR Stickers", href: "Stickers" },
  { name: "Pricing", href: "Pricing" },
];

export default function MobileNav({ open, setOpen, signedIn }: any) {
  //   const [open, setOpen] = useState(true)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-32">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={() => setOpen(false)}
                      >
                        <span className="absolute -inset-2.5" />
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    {/* <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 mt-12 text-gray-900">
                        Panel title
                      </Dialog.Title>
                    </div> */}
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      {" "}
                      {/* <div className="flex items-center gap-x-6">
                        <a href="#" className="-m-1.5 p-1.5">
                          <span className="sr-only">{appName}</span>
                          <div className="flex items-center justify-center"></div>
                        </a>
                        <a
                          href="/register"
                          className="ml-auto rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Sign up
                        </a>
                      </div> */}
                      <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                          <div className="space-y-2 py-6">
                            {navigation.map((item) => (
                              <Link
                                key={item.name}
                                to={item.href}
                                spy={true}
                                smooth={true}
                                offset={30}
                                duration={500}
                                onClick={() => setOpen(false)}
                                className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                          {signedIn ? (
                            <div className="py-6 inline-flex justify-end gap-x-2 w-full">
                              <RouterLink
                                to="/dashboard"
                                className="  rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              >
                                Dashboard
                              </RouterLink>
                            </div>
                          ) : (
                            <div className="py-6 inline-flex justify-end gap-x-2 w-full">
                              <RouterLink
                                to="/login"
                                className=" flex items-center  rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              >
                                Log in
                              </RouterLink>
                              <RouterLink
                                to="/register"
                                className=" flex items-center  rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              >
                                Sign up
                              </RouterLink>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
