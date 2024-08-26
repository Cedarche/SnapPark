import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import Spinner from "@/Reusable/Spinner";
import SpotNav from "./Spot/SpotNav";

const Redirector: React.FC = () => {
  const { uniqueID } = useParams<{ uniqueID: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLongURL = async () => {
      if (!uniqueID) return;

      try {
        const docRef = doc(db, "shortenedURLs", uniqueID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const { longURL } = docSnap.data();
          window.location.href = longURL; // Or use navigate for internal routes
        } else {
          console.log("No such document!");
          // Handle the case where the document doesn't exist (maybe redirect to a 404 page or home page)
          navigate("/"); // Redirecting to home for this example
        }
      } catch (error) {
        console.error("Error redirecting to long URL:", error);
        // Handle any errors that occur during the fetch
        navigate("/");
      }
    };

    redirectToLongURL();
  }, [uniqueID, navigate]);

  return (
    <>
      <SpotNav />
      <div className="w-full h-screen flex items-center justify-center pb-60">
        <Spinner />
      </div>
    </>
  );
};

export default Redirector;
