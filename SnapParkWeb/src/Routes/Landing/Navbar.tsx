import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { auth } from "@/firebase";
import { useRecoilValue } from "recoil";
import { userState, signedInState } from "@/Reusable/RecoilState";
import { Link, animateScroll } from "react-scroll";
import { Link as RouterLink, useLocation } from "react-router-dom";

import SnapParkLogo from "../../assets/SnapParkLogo-01.png";
import MobileNav from "./MobileNav";
import { usePostHog } from "posthog-js/react";

const navigation = [
  // { name: "Contact", href: "/contact" },
  { name: "How it works", href: "NotificationSection" },
  { name: "QR Stickers", href: "Stickers" },
  { name: "Pricing", href: "Pricing" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [signedIn, setSignedIn] = useState(false);
  const signedInRecoil = useRecoilValue(signedInState);
  const [signedIn, setSignedIn] = useState(true);

  const posthog = usePostHog();

  useEffect(() => {
    const isSignedIn = localStorage.getItem("signedIn") === "true";
    setSignedIn(isSignedIn);
  }, [signedInRecoil]);

  return (
    <header className="bg-white sticky top-0 z-50">
      <nav
        className="mx-auto flex  items-center justify-between gap-x-6 p-4 sm:p-6 lg:px-8  max-w-[1400px]"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <CustomLogoLink />
        </div>
        <div className="flex items-center">
          <div className="hidden lg:flex  lg:gap-x-12 mr-10">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                spy={true}
                smooth={true}
                offset={0}
                duration={500}
                className="text-sm font-semibold leading-6 text-gray-900 cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-1 items-center justify-end gap-x-6">
            {signedIn ? (
              <RouterLink
                to="/dashboard"
                className=" hidden sm:block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Dashboard
              </RouterLink>
            ) : (
              <>
                <RouterLink
                  to="/login"
                  onClick={() => posthog?.capture("clicked_login")}
                  className="hidden lg:block lg:text-sm lg:font-semibold lg:leading-6 lg:text-gray-900"
                >
                  Log in
                </RouterLink>
                <RouterLink
                  to="/register"
                  onClick={() => posthog?.capture("clicked_register")}
                  className="hidden lg:block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign up
                </RouterLink>
              </>
            )}
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>
      <MobileNav
        open={mobileMenuOpen}
        setOpen={setMobileMenuOpen}
        signedIn={signedIn}
      />
    </header>
  );
}

const CustomLogoLink = () => {
  const location = useLocation();

  const scrollToTop = () => {
    animateScroll.scrollToTop();
  };

  // Check if the current route is the home page
  if (location.pathname === "/") {
    return (
      <div onClick={scrollToTop} className="-m-1.5 p-1.5 cursor-pointer">
        <div className="flex items-center justify-center">
          <span className="sr-only">Snap Park</span>
          <img className="h-7 w-auto" src={SnapParkLogo} alt="Logo" />
        </div>
      </div>
    );
  } else {
    return (
      <RouterLink to="/" className="-m-1.5 p-1.5">
        <div className="flex items-center justify-center">
          <span className="sr-only">Snap Park</span>
          <img className="h-7 w-auto" src={SnapParkLogo} alt="Logo" />
        </div>
      </RouterLink>
    );
  }
};
