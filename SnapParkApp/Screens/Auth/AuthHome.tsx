import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import SnapParkLogo from "../../assets/SnapParkLogo.png";
import DismissKeyboard from "../Reusable/DismissKeyboard";
import { GradientBorderButton } from "../Reusable/GradientComponents";
import { COLORS } from "Theme/theme";
import auth from "@react-native-firebase/auth";
import Toast from "react-native-toast-message";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  officeState,
  pushNotificationToken,
  themeState,
  userState,
} from "Hooks/RecoilState";
import { onAnonymousSignIn } from "Functions/AuthFunctions";
import { CommonActions } from "@react-navigation/native";

export default function AuthHome({ navigation }) {
  const theme = useRecoilValue(themeState);
  const [userDetails, setUserDetails] = useRecoilState(userState);
  const [officeData, setOfficeData] = useRecoilState(officeState);
  const user = auth().currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const expoPushToken = useRecoilValue(pushNotificationToken);

  const handleSignOut = async (screen) => {
    setUserDetails(null);
    setOfficeData(null);
    await auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        navigation.navigate(screen);
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const handleNav = (screen) => {
    console.log(user);
    if (user) {
      handleSignOut(screen);
    } else {
      navigation.navigate(screen);
    }
  };

  useEffect(() => {
    console.log("User: ", user);
    if (!user) {
      console.log("No user, calling anonymous sign in");
      try {
        setOfficeData(null);
        onAnonymousSignIn(
          { navigation },
          expoPushToken,
          setIsLoading,
          setUserDetails
        );
      } catch (error) {
        console.log("Somethign went wrong", error);
      }
    }
  }, []);

  const handleAnon = async () => {
    console.log(userDetails?.anonymous);
    if (user && !user.displayName) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeDrawer" }],
        })
      );
    } else if (user && user.displayName) {
      await auth()
        .signOut()
        .then(() => {
          console.log("User signed out!");
          setOfficeData(null);
          onAnonymousSignIn(
            { navigation },
            expoPushToken,
            setIsLoading,
            setUserDetails
          );
        })
        .catch((error) => {
          console.error("Sign out error:", error);
        });
    } else {
      onAnonymousSignIn(
        { navigation },
        expoPushToken,
        setIsLoading,
        setUserDetails
      );
    }
  };

  return (
    <DismissKeyboard>
      <KeyboardAvoidingView
        className="flex-1 items-center justify-center "
        behavior={Platform.OS === "ios" ? "padding" : null}
      >
        <View className="flex-grow-1 h-10 items-center justify-center ">
          <Image
            source={SnapParkLogo}
            className="h-12 w-auto mt-[110]"
            style={{ resizeMode: "contain" }}
            accessibilityLabel="Snap Park Logo"
          />
        </View>

        <View className="flex-grow-1 items-center justify-center pb-[60] w-full ">
          <ActivityIndicator size={"small"} color={theme.primary} />
          <Text style={{ color: theme.primary, marginTop: 8 }}>
            Getting things set up...
          </Text>
        </View>
      </KeyboardAvoidingView>
    </DismissKeyboard>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: 50,

    shadowColor: "grey",
    shadowOpacity: 0.4,
    shadowOffset: { width: 1, height: 1 },
  },
});
