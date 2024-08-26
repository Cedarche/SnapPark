import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, User} from "firebase/auth";
import { auth } from "@/firebase";

interface PrivateRouteProps {
  children: JSX.Element;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null); // Explicitly type the state
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user); // user can be User or null, matching the state type
        setIsLoading(false);
      });
  
      // Return a function that unsubscribes from the auth listener when the component unmounts
      return () => unsubscribe();
    }, []);
  
    if (isLoading) {
      return <div></div>; // Display a loading message or spinner
    }
  
    // Redirect to login if no user, otherwise render children
    return currentUser ? children : <Navigate to="/login" replace />;
  };
