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
import { PrivateRoute } from "./Routes/PrivateRoute";
import NotFound from "./Routes/404";
import Landing from "./Routes/Landing/Landing";
import Login from "./Routes/Auth/Login/Login";
import Register from "./Routes/Auth/Register/Register";
import DashShell from "./Routes/Dashboard/DashShell";
import Spot from "./Routes/Spot/Spot";
import Home from "./Routes/Dashboard/DashComponents/Home/Home";
import Settings from "./Routes/Dashboard/DashComponents/Settings/Settings";
import Employees from "./Routes/Dashboard/DashComponents/Employees";
import ParkingSpots from "./Routes/Dashboard/DashComponents/ParkingSpots";
import Billing from "./Routes/Dashboard/DashComponents/Billing/Billing";
import Allspots from "./Routes/Spot/Allspots/Allspots";
import Redirector from "./Routes/Redirector";
import PaymentStatus from "./Routes/Dashboard/DashComponents/Billing/Stripe/PaymentStatus";
import Contact from "./Routes/Contact/Contact";
import Terms from "./Routes/Contact/TermsAndConditions";
import Privacy from "./Routes/Contact/Privacy";
// import Instructions from "./Routes/Blog/Instructions";
import QRCodeStickers from "./Routes/Dashboard/DashComponents/QRCodeStickers/QRCodeStickers";
import PricingSummary from "./Routes/Additional/AdditionalPricing/PricingSummary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashShell />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "employees", element: <Employees /> }, 
      { path: "parkingspots", element: <ParkingSpots /> }, 
      { path: "billing", element: <Billing /> }, 
      // { path: "billing/:invoice", element: <BarChartExample /> }, 
      { path: "settings/:officeSettings?", element: <Settings /> }, 
      { path: "status", element: <PaymentStatus /> }, 
      { path: "stickers", element: <QRCodeStickers /> },
      // { path: "employees", element: <Employees /> }, 
    ],
  },
  { path: "/spot/:companyID/:officeID/:spotID", element: <Spot /> },
  { path: "/all/:companyID/:officeID/:addNumber?", element: <Allspots /> },
  { path: "/all/:uniqueID", element: <Redirector /> },
  { path: "*", element: <NotFound /> },
  { path: "/contact", element: <Contact /> },
  { path: "/terms-and-conditions", element: <Terms /> },
  { path: "/privacy-policy", element: <Privacy /> },
  // { path: "/how-it-works", element: <Instructions /> },
  { path: "/pricing", element: <PricingSummary /> },
]);

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
          setUserData(data); // Update state with the user data
        });
        return () => unsubscribeDoc();
      } else {
        console.log("No user signed in.");
        localStorage.removeItem("signedIn");
        setSignedIn(false);
        setUserData(undefined); // Clear user data when signed out
      }
    });

    return () => unsubscribeAuth();
  }, [officeSettings]);

  return <RouterProvider router={router} />;
}

export default App;
