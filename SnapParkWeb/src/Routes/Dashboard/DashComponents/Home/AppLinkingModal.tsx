import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  PlusCircleIcon,
  LinkIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useRecoilValue } from "recoil";
import { userState, selectedOffice } from "@/Reusable/RecoilState";
import { addParkingSpot } from "@/Reusable/Functions/parkingSpotFunctions";
import Spinner from "@/Reusable/Spinner";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { QRCode } from "react-qrcode-logo";
import Notification from "./Notification";

type Office = {
  id: string; // Assuming id is a string
  data: {
    office: string; // Assuming office is a string within data
  };
};

export default function AppLinkingModal({ open, setOpen, officeData }: any) {
  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue<any>(userState);
  const [show, setShow] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const cancelButtonRef = useRef(null);

  console.log(officeData);

  const downloadCode = (id) => {
    setLoading(true);
    try {
      const canvas: any = document.getElementById(id);
      if (canvas) {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${id}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setLoading(false);
      }
    } catch (e) {
      console.log("Error: ", e);
      setLoading(false);
    }
  };

  const handleCopyQRImage = async (id) => {
    const element = document.getElementById(id);
    if (element instanceof HTMLCanvasElement) {
      // This checks and asserts the correct type
      element.toBlob(async (blob) => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setShow(true);
          setNotificationText("Copied QR code to clipboard");
          setTimeout(() => {
            setShow(false);
          }, 3500);
        } catch (err) {
          console.error("Failed to copy: ", err);
        }
      });
    } else {
      console.error("Element is not a canvas");
    }
  };

  const handleCopyLinkingCode = async () => {
    if (!officeData?.linkingCode) {
      console.error("No linking code available to copy");
      return;
    }
    try {
      if (userData.data.plan.name.includes("App")) {
        await navigator.clipboard.writeText(officeData.linkingCode);
        setShow(true);
        setNotificationText("Copied linking code to clipboard");
        setTimeout(() => {
          setShow(false);
        }, 3500);
      } else {
        const joinNotificationListLink = `snappark.co/all/${userData.id}/${officeData.id}/addEmployee`;
        await navigator.clipboard.writeText(joinNotificationListLink);
        setShow(true);
        setNotificationText("Copied link to clipboard");
        setTimeout(() => {
          setShow(false);
        }, 3500);
      }

    } catch (err) {
      console.error("Failed to copy linking code:", err);
      //   alert("Failed to copy the linking code."); // Error handling
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    setShow(false);
  };

  if (!officeData) {
    return null;
  }

  const linkingCode = officeData?.linkingCode;
  const jsonObj = { linkingCode: linkingCode };
  const jsonLinkingCode = JSON.stringify(jsonObj);

  const joinNotificationListLink = `snappark.co/all/${userData.id}/${officeData.id}/addEmployee`;

  const jsonString = userData.data.plan.name.includes("App")
    ? jsonLinkingCode
    : joinNotificationListLink;

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          initialFocus={cancelButtonRef}
          onClose={handleCloseModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-400 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div
              className="flex min-h-full items-end justify-center p-4 text-center
           sm:items-center sm:p-0"
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  className="relative transform overflow-hidden rounded-lg bg-white 
              text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[550px] "
                >
                  {userData.data.plan.name.includes("App") ? (
                    <div className="bg-white shadow w-full sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex flex-row gap-x-3 items-center justify-between ">
                          <div className="sm:inline-flex items-center gap-x-2">
                            <h3 className="px-0 pb-0 text-base font-semibold leading-6 text-gray-900">
                              Invite Employees to join
                            </h3>
                            <button
                              onClick={handleCopyLinkingCode}
                              className="inline-flex items-center rounded-md bg-blue-50 
                          px-2.5 py-2 text-xs font-medium text-blue-700 ring-1 ring-inset
                           ring-blue-700/10 cursor-pointer hover:text-indigo-400 "
                            >
                              Linking Code: {officeData?.linkingCode}
                              <ClipboardDocumentIcon className="w-4 h-4 ml-1.5" />
                            </button>
                          </div>
                          <button onClick={() => handleCloseModal()}>
                            <XCircleIcon className="h-5 w-5 " />
                          </button>
                        </div>
                        <div className="mt-2  text-sm font-light text-gray-500">
                          <p>
                            New employees can scan the first QR code below to
                            download the Snap Park mobile application, then use
                            either the{" "}
                            <span
                              className="text-indigo-600 cursor-pointer"
                              onClick={handleCopyLinkingCode}
                            >
                              Linking Code
                            </span>{" "}
                            or the second code to join this Office's
                            Notification List from within the application.
                          </p>

                          <p className="text-sm inline-flex items-center gap-x-2 font-light my-2.5">
                            <ExclamationCircleIcon
                              className="h-5 w-5  text-green-400"
                              aria-hidden="true"
                            />
                            The app is completely free for employees to use.
                          </p>
                        </div>

                        <section
                          aria-labelledby="summary-heading"
                          className="mt-3 rounded-xl  flex flex-col sm:flex-row bg-white  justify-evenly"
                        >
                          <div
                            className="flex flex-col rounded-xl border items-center justify-center
                        px-6 py-3 sm:py-4 sm:pb-6 shadow-sm"
                          >
                            <h2
                              id="summary-heading"
                              className="text-md font-medium mb-2 text-gray-900"
                            >
                              Mobile App
                            </h2>
                            <QRCode
                              value={officeData.shortURL}
                              size={160}
                              qrStyle="squares"
                              eyeRadius={2}
                              id={"MobileAppQR"}
                              bgColor="#ffffff"
                              ecLevel="M"
                            />
                            <div className="w-full inline-flex gap-x-2 mt-4">
                              <button
                                onClick={() => handleCopyQRImage("MobileAppQR")}
                                className="border rounded-md px-2 py-1 text-indigo-700 cursor:pointer hover:text-indigo-400 bg-gray-50"
                              >
                                <ClipboardDocumentListIcon className="w-5 h-5 " />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadCode("MobileAppQR")}
                                disabled={loading}
                                className="  w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 
            text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                              >
                                {loading ? (
                                  <div className="inline-flex">
                                    <Spinner />
                                  </div>
                                ) : (
                                  "Download"
                                )}
                              </button>
                            </div>
                          </div>
                          <div
                            className="flex mt-4 sm:mt-0 flex-col rounded-xl border items-center justify-center
                      px-6 py-3 sm:py-4 sm:pb-6 shadow-sm"
                          >
                            <h2
                              id="summary-heading"
                              className="text-md font-medium mb-2 text-gray-600"
                            >
                              Join Office Link
                            </h2>
                            <QRCode
                              value={jsonString}
                              size={160}
                              qrStyle="squares"
                              eyeRadius={2}
                              id={"linkingCode"}
                              bgColor="#ffffff"
                              ecLevel="M"
                            />
                            <div className="w-full inline-flex gap-x-2 mt-4">
                              <button
                                onClick={() => handleCopyQRImage("linkingCode")}
                                className="border rounded-md px-2 py-1 text-indigo-700 cursor:pointer hover:text-indigo-400 bg-gray-50"
                              >
                                <ClipboardDocumentListIcon className="w-5 h-5 " />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadCode("linkingCode")}
                                disabled={loading}
                                className="  w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 
            text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                              >
                                {loading ? (
                                  <div className="inline-flex">
                                    <Spinner />
                                  </div>
                                ) : (
                                  "Download"
                                )}
                              </button>
                            </div>
                          </div>
                        </section>
                        <div className="w-full flex flex-row items-center"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white shadow w-full sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex flex-row gap-x-3 items-center justify-between ">
                          <div className="sm:inline-flex items-center gap-x-2">
                            <h3 className="px-0 pb-0 text-base font-semibold leading-6 text-gray-900">
                              Invite Employees to join
                            </h3>
                          </div>
                          <button onClick={() => handleCloseModal()}>
                            <XCircleIcon className="h-5 w-5 " />
                          </button>
                        </div>
                        <div className="mt-2  text-sm font-light text-gray-500">
                          <p>
                            Employees can scan the QR code below to opt-in to
                            receiving parking text notifications - or simply
                            copy and send out the{" "}
                            <span
                              className="text-indigo-600 cursor-pointer"
                              onClick={handleCopyLinkingCode}
                            >
                              link.
                            </span>{" "}
                          </p>

                          <p className="text-sm inline-flex items-center gap-x-2 font-light my-2.5">
                            <ExclamationCircleIcon
                              className="h-5 w-5  text-green-400"
                              aria-hidden="true"
                            />
                            Employees can pause of opt-out of notifications at
                            any time.
                          </p>
                        </div>

                        <section
                          aria-labelledby="summary-heading"
                          className="mt-3 rounded-xl  flex flex-col sm:flex-row bg-white  justify-evenly"
                        >
                          <div
                            className="flex mt-4 sm:mt-0 flex-col rounded-xl border items-center justify-center
                    px-6 py-3 sm:py-4 sm:pb-6 shadow-sm"
                          >
                            <h2
                              id="summary-heading"
                              className="text-md font-medium mb-2 text-gray-600"
                            >
                              Join Notifification List
                            </h2>
                            <QRCode
                              value={jsonString}
                              size={160}
                              qrStyle="squares"
                              eyeRadius={2}
                              id={"linkingCode"}
                              bgColor="#ffffff"
                              ecLevel="M"
                            />
                            <div className="w-full inline-flex gap-x-2 mt-4">
                              <button
                                onClick={() => handleCopyQRImage("linkingCode")}
                                className="border rounded-md px-2 py-1 text-indigo-700 cursor:pointer hover:text-indigo-400 bg-gray-50"
                              >
                                <ClipboardDocumentListIcon className="w-5 h-5 " />
                              </button>
                              <button
                                type="button"
                                onClick={() => downloadCode("linkingCode")}
                                disabled={loading}
                                className="  w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 
          text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                              >
                                {loading ? (
                                  <div className="inline-flex">
                                    <Spinner />
                                  </div>
                                ) : (
                                  "Download"
                                )}
                              </button>
                            </div>
                          </div>
                        </section>
                        <div className="mt-6  text-sm font-light text-gray-500">
                          <p>
                            Alternatively, once all the office QR Code stickers
                            have been placed, employees can just scan the
                            sticker when they arrvive and join the notification
                            list that way.{" "}
                          </p>
                        </div>

                        <div className="w-full flex flex-row items-center"></div>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <Notification
        show={show}
        setShow={setShow}
        notificationText={notificationText}
      />
    </>
  );
}
