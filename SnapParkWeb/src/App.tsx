import { useEffect, useMemo } from "react";
import "./App.css";
import posthog from "posthog-js";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RecoilRoot, useRecoilValue } from "recoil";
import { onAuthStateChanged } from "firebase/auth";
import { DocumentData } from "firebase/firestore";
import { auth } from "./firebase";
import { getCompanyData } from "./Reusable/Functions/dataFetching";
import { useRecoilState } from "recoil";
import {
  userState,
  signedInState,
  officeSettingsState,
} from "./Reusable/RecoilState";
import useLocation from "./Reusable/Hooks/getLocation";
import routerConfig from "./routerConfig";

const router = createBrowserRouter(routerConfig);

function App() {
  const [userData, setUserData] = useRecoilState<DocumentData | undefined>(
    userState,
  );
  const [signedIn, setSignedIn] = useRecoilState<boolean>(signedInState);
  const officeSettings = useRecoilValue(officeSettingsState);

  useLocation();

  useEffect(() => {
    // Assume user is signed in if there's an item in local storage - Just for quick rendering of dashboard/login button text
    const isSignedIn = localStorage.getItem("signedIn") === "true";
    setSignedIn(isSignedIn);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        localStorage.setItem("signedIn", "true");
        setSignedIn(true);
        const unsubscribeDoc = getCompanyData(user.uid, (data) => {
          setUserData(data); 
        });
        return () => unsubscribeDoc();
      } else {
        // console.log("No user signed in.");
        localStorage.removeItem("signedIn");
        setSignedIn(false);
        setUserData(undefined); 
      }
    });

    return () => unsubscribeAuth();
  }, [officeSettings]);

  return <RouterProvider router={router} />;
}

export default App;
