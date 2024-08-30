import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "@/firebase";

import SpotNav from "./SpotComponents/SpotNav";
import AddNumber from "./SpotComponents/AddNumberPopup";
import Spinner from "@/Reusable/Spinner";
import Empty from "./SpotComponents/Empty";
import SpotsFull from "./SpotComponents/SpotsFullAlert";
import ThreeSpotsLeftAlert from "./SpotComponents/threeSpotsLeftAlert";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { MobileSignUp } from "./BottomSheet/BottomSheet";
import { defaultSettings } from "@/Reusable/Types/spotTypes";
import { useOfficeData } from "@/Reusable/Hooks/SpotHooks/useOfficeData";
import { useUserNotificationStatus } from "@/Reusable/Hooks/SpotHooks/useUserNotificationStatus";
import { useSpotAvailability } from "@/Reusable/Hooks/SpotHooks/useSpotAvailability";
import SpotContainer from "./SpotComponents/SpotContainer";

export default function Spot() {
  const params = useParams<{
    companyID: string;
    officeID: string;
    spotID: string;
  }>();
  const { companyID, officeID, spotID } = params;
  const [show, setShow] = useState(false);
  const [spotsFull, setShowSpotsFull] = useState(false);
  const [threeLeft, setThreeLeft] = useState(false);
  const [openBottomSheet, setOpenBottomSheet] = useState(false);
  const [isCompany, setIsCompany] = useState(false);
  const [name, setName] = useState<any>("");
  const [mobile, setMobile] = useState<any>("");
  const [update, setUpdate] = useState(false);

  const [expandOnContentDrag, setExpandOnContentDrag] = useState(true);

  const navigate = useNavigate();
  const user = auth.currentUser;
  useEffect(() => {
    if (user) {
      setIsCompany(true);
    }
  }, [user]);

  const { officeData, isSpotFound, available } = useOfficeData(
    companyID!,
    officeID,
    spotID!,
  );
  const {
    notifications,
    setNotifications,
    loading: notificationLoading,
  } = useUserNotificationStatus(
    companyID!,
    officeID!,
    localStorage.getItem("mobile") || "",
  );
  const { handleToggleAvailability, loading } = useSpotAvailability(
    companyID!,
    officeID!,
    spotID!,
    officeData,
    localStorage.getItem("name"),
    localStorage.getItem("mobile"),
    setShow,
    setShowSpotsFull,
    setThreeLeft,
  );

  const handleNavigate = () => {
    const url = `/all/${companyID}/${officeID}`;
    navigate(url);
  };

  if (!isSpotFound) {
    return (
      <>
        <SpotNav />
        <Empty />
      </>
    );
  }

  return (
    <>
      {officeData ? (
        <>
          <BottomSheet
            open={openBottomSheet}
            onDismiss={() => setOpenBottomSheet(false)}
            defaultSnap={({ maxHeight }) => maxHeight / 2}
            snapPoints={({ maxHeight }) => [maxHeight * 0.5]}
            expandOnContentDrag={expandOnContentDrag}
          >
            <MobileSignUp
              setOpenBottomSheet={setOpenBottomSheet}
              companyID={companyID}
              officeName={officeData?.office}
              officeID={officeID}
              update={update}
              setUpdate={setUpdate}
            />
          </BottomSheet>
          <AddNumber
            show={show}
            setShow={setShow}
            open={openBottomSheet}
            setOpen={setOpenBottomSheet}
          />

          <SpotsFull show={spotsFull} setShow={setShowSpotsFull} />
          <ThreeSpotsLeftAlert
            show={threeLeft}
            setShow={setThreeLeft}
            notificationSettings={
              officeData?.notificationSettings ?? defaultSettings
            }
          />
          <SpotNav
            companyID={companyID}
            officeID={officeID}
            setOpenBottomSheet={setOpenBottomSheet}
            isCompany={isCompany}
            notifications={notifications}
            setNotifications={setNotifications}
            name={name}
            setName={setName}
            mobile={mobile}
            setMobile={setMobile}
          />
          <SpotContainer
            officeData={officeData}
            spotID={spotID}
            available={available}
            handleNavigate={handleNavigate}
            handleToggleAvailability={handleToggleAvailability}
            loading={loading}
          />
        </>
      ) : (
        <div className="w-full flex items-center justify-center h-screen pb-40">
          <Spinner />
        </div>
      )}
    </>
  );
}
