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

const routerConfig = [
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
  ]

  export default routerConfig;