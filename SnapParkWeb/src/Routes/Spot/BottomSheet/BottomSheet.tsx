import { useState, useEffect, ChangeEvent } from "react";

import { auth, db, functions } from "@/firebase";
// import { addToNotificationList } from "@/Reusable/Functions/notificationFunctions";
import { httpsCallable } from "firebase/functions";

import {
  BellAlertIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "./PhoneNumber.css";
import Spinner from "@/Reusable/Spinner";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

import { InputOTPForm } from "./OTPForm";

export function MobileSignUp({
  setOpenBottomSheet,
  companyID,
  officeName,
  officeID,
  setName,
  setUserMobile,
  setNotifications,
  update,
  setUpdate,
}: any) {
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);
  const [otp, setOtp] = useState<string>("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved, you might want to automatically send the OTP here
        console.log("Recapture solved");
      },
    });
    setRecaptchaVerifier(verifier);
  }, []);

  const handleSendOTP = async () => {
    if (!isValidPhoneNumber(mobile)) {
      alert("Invalid phone number.");
      return;
    }

    setLoading(true);

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        mobile,
        recaptchaVerifier,
      );
      setConfirmationResult(confirmation);
      setShowOTP(true);
    } catch (error) {
      console.error("OTP ERROR: ", error);
      alert("Failed to send OTP. Please try again.");
      setLoading(false);
      setSuccess(true);
      localStorage.setItem("notifications", "true");
      localStorage.setItem("name", userName);
      localStorage.setItem("mobile", String(mobile));
      setTimeout(() => {
        setOpenBottomSheet(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (confirmationResult && otp.trim().length === 6) {
      try {
        setLoading(true);
        const result = await confirmationResult.confirm(otp);
        // User successfully verified, result.user will contain user details
        console.log(result.user);
        alert("Phone number verified!");

        // Update user's displayName to userName
        if (result.user) {
          await updateProfile(result.user, {
            displayName: userName,
          })
            .then(() => {
              console.log("User's displayName updated successfully");
              // You can perform additional actions here if needed
            })
            .catch((error) => {
              console.error("Failed to update user's displayName:", error);
            });
          const newEmployee = {
            name: userName,
            mobile: mobile,
            office: officeName,
            notifications: true,
          };

          // Use the user UID as the document ID in the 'employees' collection
          const employeeDocRef = doc(db, "employees", result.user.uid);

          // Set the document data
          await setDoc(employeeDocRef, newEmployee);
        }

        handleAddUser(); // Assuming this function does additional user setup
        // Proceed with your signup or login flow
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Please enter a valid 6-digit OTP.");
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!isValidPhoneNumber(mobile)) {
      alert("Invalid phone number.");
      return;
    }
    setLoading(true);
    if (userName && mobile && companyID && officeName) {
      console.log(userName, mobile, companyID, officeName);
      const newEmployee = {
        name: userName,
        mobile: mobile,
        office: officeName,
        notifications: true,
        expoPushToken: ''
      };

      // Create a callable reference to your cloud function
      const addToNotificationList = httpsCallable(
        functions,
        "addToNotificationList",
      );

      try {
        // Call the function and pass data
        const result = await addToNotificationList({
          userId: companyID,
          officeId: officeID,
          newEmployee,
        });
        console.log("Function result:", result.data);
        setSuccess(true);
        localStorage.setItem("notifications", "true");
        localStorage.setItem("name", userName);
        localStorage.setItem("mobile", String(mobile));
        setName(userName);
        setUserMobile(String(mobile));
        setNotifications(true);

        setTimeout(() => {
          setOpenBottomSheet(false);
          setUpdate(false);
        }, 2000);
      } catch (e) {
        console.error("Error adding user to notification list:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="flex flex-col px-5 py-2 w-full items-center">
        <div id="recaptcha-container"></div>

        <CheckCircleIcon className="w-14 h-14 mt-3 text-green-500" />
        <div className="text-gray-700 font-medium text-lg mt-3">
          {update
            ? "Successfully updated details!"
            : "Successfully added to Notification List!"}
        </div>
        <div className="text-gray-600 font-medium text-sm mt-3 text-center px-5">
          You can change your notification settings by clicking the menu icon in
          the top right
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-5 py-2 w-full ">
      <div id="recaptcha-container"></div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <BellAlertIcon
              className="h-6 w-6 mb-1  text-indigo-800"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0">
            <p className="text-lg font-bold text-gray-900">
              {update
                ? "Update your contact details"
                : "Join the notification list"}
            </p>
            <p className="mt-1 text-xs text-gray-500"></p>
          </div>
          <div className=" flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => {
                setOpenBottomSheet(false);
              }}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        {update ? (
          <div className="mt-2.5 mb-1.5 text-sm font-light">
            Make sure either your name or mobile still match your original
            contact details.
          </div>
        ) : (
          <div className="mt-2.5 mb-1.5 text-sm font-light">
            We'll send you notifications when the carpark is full, or
            approaching full. Contact your office admin to opt-out, or simply
            toggle notifications off.
          </div>
          // null
        )}
      </div>
      {showOTP ? (
        <>
          <div className="flex  w-full flex-col items-center justify-center border rounded-xl mt-4 pb-5 shadow-sm ">
            <div className="w-full flex items-center justify-between px-5 mb-5 mt-5 font-normal text-gray-500">
              OTP Sent to: <span className="text-indigo-600">{mobile}</span>
            </div>
            <DevicePhoneMobileIcon className="w-14 h-14 mb-6" />
            {/* <InputOTPDemo setOtp={setOtp}/> */}
            <InputOTPForm setOtp={setOtp} />
          </div>
          <div className="w-full flex items-center text-gray-500 justify-end font-medium text-sm mt-1.5 pr-1">
            Didn't recieve it?{" "}
            <span className="text-blue-600 ml-1">Send again</span>
          </div>
          <button
            type="button"
            //   onClick={handleSendOTP}
            onClick={handleVerifyOTP}
            disabled={loading}
            className="inline-flex items-center justify-center gap-x-1.5 rounded-xl bg-indigo-600 px-3 py-3 mt-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {loading ? (
              <div className="inline-flex gap-x-2">
                <Spinner />
              </div>
            ) : (
              <div className="inline-flex gap-x-1.5 items-center">
                Verify Code
              </div>
            )}
          </button>
        </>
      ) : (
        <>
          <div className=" mt-2.5 flex flex-col gap-y-3  rounded-xl ">
            <div>
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium  text-gray-800"
              >
                Name
              </label>
              <div className="mt-0.5">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:text-sm sm:leading-6"
                  placeholder="Jane Smith"
                />
              </div>
            </div>
            <div className="flex flex-col ">
              <label
                htmlFor="phone-number"
                className="block text-sm font-medium  text-gray-600"
              >
                Contact Phone Number
              </label>
              <div className="relative mt-1 rounded-md shadow-sm w-full">
                <PhoneInput
                  // country="AU"
                  className="my-phone-input2"
                  placeholder="Enter phone number"
                  defaultCountry={"AU"}
                  value={mobile}
                  onChange={(value) => {
                    // Call setMobile with the value if it's not undefined, otherwise set it to an empty string or handle it as you see fit
                    setMobile(value || "");
                  }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddUser}
            // onClick={handleSendOTP}
            disabled={!mobile || !userName || loading}
            className={`inline-flex items-center justify-center gap-x-1.5 mx-0  rounded-xl px-3 py-3 mt-4 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 
    ${!mobile || !userName ? "bg-indigo-300 text-gray-700 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-500"}`}
          >
            {loading ? (
              <div className="inline-flex gap-x-2">
                <Spinner />
              </div>
            ) : (
              <div className="inline-flex gap-x-1.5 items-center text-md">
                Confirm{" "}
                {/* <CheckCircleIcon
                  className="-mr-0.5 h-4 w-4"
                  aria-hidden="true"
                /> */}
              </div>
            )}
          </button>
          {update && (
            <button
              type="button"
              onClick={handleAddUser}
              // onClick={handleSendOTP}
              disabled={!mobile || !userName || loading}
              className={`inline-flex items-center justify-center gap-x-1.5 mx-0  rounded-xl px-3 py-3 mt-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 
    ${!mobile || !userName ? "bg-red-300 text-gray-700 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-500"}`}
            >
              {loading ? (
                <div className="inline-flex gap-x-2">
                  <Spinner />
                </div>
              ) : (
                <div className="inline-flex gap-x-1.5 items-center text-md">
                  Delete Account{" "}
            
                </div>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
