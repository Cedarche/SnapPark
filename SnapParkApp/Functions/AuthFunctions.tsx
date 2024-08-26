import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/functions";
import firestore from "@react-native-firebase/firestore";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import { appleAuth } from "@invertase/react-native-apple-authentication";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  offlineAccess: true,
});

export const handleSignOut = () => {
  auth()
    .signOut()
    .then(() => {
      console.log("User signed out!");
      // Try a direct navigation to 'AuthHome' after sign out

      // navigation.navigate("Auth", { screen: "AuthHome" });
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
};

export const handleNotificationToggle = async (
  officeData,
  userDetails,
  setUserDetails
) => {
  const companyID = userDetails.company;
  const officeID = userDetails.office;

  const user = auth().currentUser;
  // const mobile = user.phoneNumber;
  const mobile = userDetails.mobile;

  if (companyID && officeID && mobile) {
    try {
      const toggleNotifications = firebase
        .app()
        .functions("europe-west1")
        .httpsCallable("toggleEmployeeNotification");

      const employeeUID = user.uid;
      // console.log(companyID, officeID, mobile, employeeUID);
      const result = await toggleNotifications({
        companyID,
        officeID,
        mobile,
        employeeUID,
      });
      console.log(result);

      if (result.data.updated) {
        const newNotifications = result.data.newNotifications;
        setUserDetails((currentDetails) => ({
          ...currentDetails,
          notifications: newNotifications,
        }));
        const userDocRef = firestore().collection("employees").doc(user.uid);

        // Update the user document with the new notifications
        await userDocRef.update({
          notifications: newNotifications,
        });
        console.log("Success!");
      } else {
        console.log("Failed to update notifications or employee not found.");
      }
    } catch (error) {
      console.error(
        "Failed to toggle notifications for mobile:",
        mobile,
        error
      );
      alert("Failed to toggle notifications. Please try again.");
    }
  } else {
    console.log("Required data not provided for notification toggle.");
  }
};

export async function onAppleButtonPress(
  { navigation },
  expoPushToken,
  setIsLoading,
  setUserDetails
) {
  // const expoPushToken = useRecoilValue(pushNotificationToken);
  setIsLoading(true);
  let nextStep = null;

  try {
    console.log(appleAuth.isSupported);
    if (!appleAuth.isSupported) {
      setIsLoading(false);
      Toast.show({
        type: "error",
        text1: "Not supported",
        text2: "Apple Sign-In is not supported on this device.",
      });
      // throw new Error("Apple Sign-In is not supported on this device.");
    }

    console.log("Attempting apple sign in");

    // Start an Apple sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const fullName = appleAuthRequestResponse.fullName;

    // Extract the token and nonce
    const { identityToken, nonce } = appleAuthRequestResponse;
    if (!identityToken) {
      setIsLoading(false);

      throw new Error("Apple Sign-In failed - no identity token returned");
    }

    // Create a Firebase `AppleAuthProvider` credential
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce
    );

    // Use the created `AppleAuthProvider` credential to start a Firebase auth request
    const userCredential = await auth().signInWithCredential(appleCredential);
    const user = userCredential.user;
    if (userCredential.additionalUserInfo.isNewUser) {
      console.log(fullName);
      const name = `${fullName.givenName} ${fullName.familyName}`;
      await user.updateProfile({
        displayName: name,
      });

      const newEmployee = {
        uid: userCredential.user.uid,
        name: fullName || "",
        email: userCredential.user.email,
        mobile: null,
        company: "",
        office: "",
        notifications: true,
        expoPushToken: expoPushToken,
        alternativeParkingList: [],
        anonymous: false,
      };
      await firestore()
        .collection("employees")
        .doc(userCredential.user.uid)
        .set(newEmployee);
      // console.log("Employee document created/updated successfully!");
      setIsLoading(false);

      // navigation.navigate("EnterName");
      nextStep = "EnterName";
    } else {
      const docRef = firestore()
        .collection("employees")
        .doc(userCredential.user.uid);
      const documentSnapshot = await docRef.get();
      if (documentSnapshot.exists) {
        console.log("Employee already exists");
        const employeeData = documentSnapshot.data();
        // console.log("Employee Data: ", employeeData);
        // console.log("Mobile: ", employeeData.mobile);

        if (
          employeeData.company &&
          employeeData.expoPushToken !== expoPushToken
        ) {
          await docRef.update({ expoPushToken: expoPushToken });
          employeeData.expoPushToken = expoPushToken;
          // console.log("Updating expoPushToken in Firestore.");

          const addToNotificationList = firebase
            .app()
            .functions("europe-west1")
            .httpsCallable("addToNotificationList");

          const result = await addToNotificationList({
            userId: employeeData?.company,
            officeId: employeeData?.office,
            newEmployee: employeeData,
          });

          console.log("Updated expoPushToken in Firestore.", result.data);
        }
        // else if (!userCredential.user.phoneNumber) {
        //   console.log("No mobile on record");
        //   setIsLoading(false);

        //   navigation.navigate("Mobile");
        //   return;
        // }
        else if (
          // userCredential.user.phoneNumber &&
          !employeeData.company ||
          !employeeData.office
        ) {
          console.log("User hasnt been onboarded");
          setIsLoading(false);

          // navigation.navigate("EnterName");
          nextStep = "EnterName";

          return;
        }

        setUserDetails(employeeData);
        if (!nextStep) {
          nextStep = "HomeDrawer";
        }
      } else {
        console.error("No employee data found!");
        Toast.show({
          type: "error",
          text1: "No Data",
          text2: "No employee details found, please create an account.",
        });
        setIsLoading(false);
      }
    }
  } catch (error) {
    setIsLoading(false);

    console.error("Apple Sign-In failed:", error);
    // Optionally handle different error cases
    // e.g., show a user-friendly message, retry, etc.
  }
  return { nextStep };
}

export async function onGoogleButtonPress(
  { navigation },
  expoPushToken,
  setIsLoading,
  setUserDetails
) {
  setIsLoading(true);
  let nextStep = null;

  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices();

    // Get the user's ID token
    const { idToken, user } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Use the created Google credential to start a Firebase auth request
    const userCredential = await auth().signInWithCredential(googleCredential);

    // Update the display name if it's a new user
    if (userCredential.additionalUserInfo.isNewUser) {
      console.log("New Google user");
      const newEmployee = {
        uid: userCredential.user.uid,
        name: "",
        email: userCredential.user.email,
        mobile: null,
        company: "",
        office: "",
        notifications: true,
        expoPushToken: expoPushToken,
        alternativeParkingList: [],
        anonymous: false,
      };
      await firestore()
        .collection("employees")
        .doc(userCredential.user.uid)
        .set(newEmployee);
      setIsLoading(false);

      // navigation.navigate("EnterName");
      nextStep = "EnterName";
    } else {
      const docRef = firestore()
        .collection("employees")
        .doc(userCredential.user.uid);
      const documentSnapshot = await docRef.get();
      if (documentSnapshot.exists) {
        const employeeData = documentSnapshot.data();

        if (
          employeeData.company &&
          employeeData.expoPushToken !== expoPushToken
        ) {
          await docRef.update({ expoPushToken: expoPushToken });
          employeeData.expoPushToken = expoPushToken;
          // console.log("Updated expoPushToken in Firestore.");

          const addToNotificationList = firebase
            .app()
            .functions("europe-west1")
            .httpsCallable("addToNotificationList");

          const result = await addToNotificationList({
            userId: employeeData?.company,
            officeId: employeeData?.office,
            newEmployee: employeeData,
          });

          console.log("Updated expoPushToken in Firestore.", result.data);
        }
        // else if (!userCredential.user.phoneNumber) {
        //   console.log("No mobile on record");
        //   setIsLoading(false);

        //   navigation.navigate("Mobile");
        //   return;
        // }
        else if (
          // userCredential.user.phoneNumber &&
          !employeeData.company ||
          !employeeData.office
        ) {
          console.log("User hasnt been onboarded");
          setIsLoading(false);

          // navigation.navigate("EnterName");
          nextStep = "EnterName";
          return;
        }

        setUserDetails(employeeData);

        nextStep = "HomeDrawer";
        // navigation.dispatch(
        //   CommonActions.reset({
        //     index: 0,
        //     routes: [{ name: "HomeDrawer" }],
        //   })
        // );
      } else {
        console.error("No employee data found!");
        Toast.show({
          type: "error",
          text1: "No Data",
          text2: "No employee details found.",
        });
      }
    }

    // User is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
  } catch (error) {
    setIsLoading(false);

    console.error("Google Sign-In failed:", error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.error("User cancelled the login flow");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.error("Sign in is in progress already");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error("Play services not available or outdated");
    } else {
      console.error("Some other error happened:", error);
    }
    // Optionally handle different error cases
    // e.g., show a user-friendly message, retry, etc.
  }
  return { nextStep };
}

export async function onAnonymousSignIn(
  { navigation },
  expoPushToken,
  setIsLoading,
  setUserDetails
) {
  setIsLoading(true);

  try {
    // Sign in anonymously
    const userCredential = await auth().signInAnonymously();

    // Update the display name if it's a new user
    if (userCredential.additionalUserInfo.isNewUser) {
      console.log("New anonymous user");
      const newEmployee = {
        uid: userCredential.user.uid,
        name: "",
        email: "",
        mobile: null,
        company: "",
        office: "",
        notifications: true,
        expoPushToken: expoPushToken,
        alternativeParkingList: [],
        anonymous: true,
      };
      await firestore()
        .collection("employees")
        .doc(userCredential.user.uid)
        .set(newEmployee);

      console.log("New Anonymous user: ", newEmployee);
      setUserDetails(newEmployee);
      setIsLoading(false);

      // Reset navigation state and navigate to 'NoUserDrawer'
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "NoUserDrawer" }],
        })
      );
    } else {
      const docRef = firestore()
        .collection("employees")
        .doc(userCredential.user.uid);
      const documentSnapshot = await docRef.get();
      if (documentSnapshot.exists) {
        const employeeData = documentSnapshot.data();

        if (
          employeeData.company &&
          employeeData.expoPushToken !== expoPushToken
        ) {
          await docRef.update({ expoPushToken: expoPushToken });
          employeeData.expoPushToken = expoPushToken;
          console.log("Updated expoPushToken in Firestore.");

          const addToNotificationList = firebase
            .app()
            .functions("europe-west1")
            .httpsCallable("addToNotificationList");

          const result = await addToNotificationList({
            userId: employeeData?.company,
            officeId: employeeData?.office,
            newEmployee: employeeData,
          });

          console.log("Updated expoPushToken in Firestore.", result.data);
        } else if (!employeeData.company || !employeeData.office) {
          console.log("User hasn't been onboarded");
          setIsLoading(false);

          // Reset navigation state and navigate to 'EnterName'
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "HomeDrawer" }],
            })
          );
          return;
        }

        setUserDetails(employeeData);

        // Reset navigation state and navigate to 'HomeDrawer'
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeDrawer" }],
          })
        );
      } else {
        console.error("No employee data found!");
        Toast.show({
          type: "error",
          text1: "No Data",
          text2: "No employee details found.",
        });
      }
    }
  } catch (error) {
    setIsLoading(false);

    console.error("Anonymous sign-in failed:", error);

    // Optionally handle different error cases
    // e.g., show a user-friendly message, retry, etc.
  }
}

export async function createAccountWithEmail(
  { navigation },
  name,
  email,
  password,
  expoPushToken,
  setIsLoading
) {
  setIsLoading(true);

  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );

    // Update the display name
    await userCredential.user.updateProfile({
      displayName: name,
    });

    // Check if the user is new
    if (userCredential.additionalUserInfo.isNewUser) {
      console.log("New user created with email");
      // console.log(userCredential.user);
      const newEmployee = {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        mobile: null,
        company: "",
        office: "",
        notifications: true,
        expoPushToken: expoPushToken,
        alternativeParkingList: [],
        anonymous: false,
      };
      await firestore()
        .collection("employees")
        .doc(userCredential.user.uid)
        .set(newEmployee);
      console.log("Employee document created/updated successfully!");
      setIsLoading(false);

      navigation.navigate("EnterName");
    } else {
      console.log(userCredential.user);
      setIsLoading(false);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeDrawer" }],
        })
      );
    }
  } catch (error) {
    setIsLoading(false);

    if (error.code === "auth/email-already-in-use") {
      console.log("That email address is already in use!");
      Toast.show({
        type: "error",
        text1: "Email already in use",
        text2: "Click here to go to login",
        visibilityTime: 4000,
        onPress() {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: "Auth",
                  state: {
                    routes: [
                      {
                        name: "Login",
                      },
                    ],
                  },
                },
              ],
            })
          );
        },
      });
    } else if (error.code === "auth/invalid-email") {
      console.log("That email address is invalid!");
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please use a valid email address",
      });
    } else {
      console.error("Email sign in error: ", error);
      Toast.show({
        type: "error",
        text1: "Somethign went wrong...",
        text2: "Please try again.",
      });
    }
  }
}

export async function emailSignIn(
  email,
  password,
  expoPushToken,
  setIsLoading,
  setUserDetails
) {
  setIsLoading(true);
  let nextStep = null;

  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password
    );

    const docRef = firestore()
      .collection("employees")
      .doc(userCredential.user.uid);
    const documentSnapshot = await docRef.get();
    if (documentSnapshot.exists) {
      const employeeData = documentSnapshot.data();
      if (
        employeeData.company &&
        employeeData.expoPushToken !== expoPushToken
      ) {
        await docRef.update({ expoPushToken: expoPushToken });
        employeeData.expoPushToken = expoPushToken;

        const addToNotificationList = firebase
          .app()
          .functions("europe-west1")
          .httpsCallable("addToNotificationList");

        const result = await addToNotificationList({
          userId: employeeData?.company,
          officeId: employeeData?.office,
          newEmployee: employeeData,
        });

        console.log("Updated expoPushToken in Firestore.", result.data);
      } else if (!employeeData.company || !employeeData.office) {
        console.log("User hasnt been onboarded");
        // setIsLoading(false);
        nextStep = "EnterName";

        // navigation.navigate("EnterName");
      }

      setUserDetails(employeeData);
      if (!nextStep) {
        nextStep = "HomeDrawer";
      }
    } else {
      Toast.show({
        type: "error",
        text1: "No Data",
        text2: "No employee details found please register an account.",
      });
      setIsLoading(false);
      return;
    }
  } catch (error) {
    setIsLoading(false);

    if (error.code === "auth/email-already-in-use") {
      Toast.show({
        type: "error",
        text1: "Existing Account",
        text2: "That email address is already in use!",
      });
    }

    if (error.code === "auth/invalid-credential") {
      Toast.show({
        type: "error",
        text1: "Invalid Email or Password",
        text2: "Click here to reset password",
        visibilityTime: 6000,
        onPress: () => {
          Toast.hide();
          console.log("Reset");
          sendPasswordResetEmail(email);
        },
      });
    }
    if (error.code === "auth/invalid-email") {
      Toast.show({
        type: "error",
        text1: "Invalid Email or Password",
        text2: "That email address is already in use!",
      });
    }

    console.error("Email sign in error: ", error);
  }
  return { nextStep };
}

export async function handleConfirmMobile({ navigation }, mobile, setLoading) {
  if (mobile && mobile.length > 5) {
    setLoading(true);

    const phoneNumber = parsePhoneNumberFromString(mobile);
    if (!phoneNumber || !phoneNumber.isValid()) {
      console.error("Invalid phone number");
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Invalid phone number",
        text2: "Please use an international format (e.g., +1234567890)",
      });
      return;
    }

    const formattedNumber = phoneNumber.formatInternational();
    const currentUser = auth().currentUser;

    if (currentUser) {
      try {
        const confirmation = await auth().verifyPhoneNumber(formattedNumber);
        setLoading(false);
        navigation.navigate("Confirm", {
          mobile: formattedNumber,
          confirmation,
          updatePhoneNumber: true,
        });
      } catch (error) {
        console.error("Failed to send OTP:", error);
        Toast.show({
          type: "error",
          text1: "Something went wrong",
          text2: `${error.message}`,
        });
        setLoading(false);
      }
    } else {
      try {
        const confirmation = await auth().signInWithPhoneNumber(
          formattedNumber
        );
        setLoading(false);
        navigation.navigate("Confirm", {
          mobile: formattedNumber,
          confirmation,
        });
      } catch (error) {
        console.error("Failed to send OTP:", error);
        Toast.show({
          type: "error",
          text1: "Something went wrong",
          text2: `${error.message}`,
        });
        setLoading(false);
      }
    }
  }
}

const sendPasswordResetEmail = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
    Toast.show({
      type: "success",
      text1: "Password reset email sent!",
      text2: "Please check your inbox for the reset code.",
      visibilityTime: 4000,
    });
    // Optionally, you can return some success message or status
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Something went wrong",
      text2: "Reset password email couldn't be sent, please try again.",
    });
    // Optionally, you can return the error for further handling
  }
};

export const deleteUserAccount = async ({ navigation }, setIsLoading) => {
  setIsLoading(true);

  try {
    const user = auth().currentUser;

    if (!user) {
      throw new Error("No user is currently signed in.");
    }

    // Delete user document from Firestore
    await firestore().collection("employees").doc(user.uid).delete();

    // Delete user authentication profile
    await user.delete();
    console.log("User authentication profile deleted successfully!");

    setIsLoading(false);

    // Navigate to the login screen or any other appropriate screen
    navigation.navigate("Login");
  } catch (error) {
    setIsLoading(false);

    if (error.code === "auth/requires-recent-login") {
      console.log(
        "The user needs to re-authenticate before deleting the account."
      );
      // Here you should prompt the user to re-authenticate and then call this function again
      // For example, you might navigate to a re-authentication screen
      navigation.navigate("Reauthenticate", {
        onReauthenticated: deleteUserAccount,
      });
    } else {
      console.error("User deletion error: ", error);
    }
  }
};
