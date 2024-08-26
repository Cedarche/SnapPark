import { useState, useEffect, useRef, createRef } from "react";
import { StatusBar } from "expo-status-bar";
import { RecoilRoot, useRecoilState } from "recoil";
import { userState } from "Hooks/RecoilState";
import { NavigationContainer, CommonActions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "Navigation/AuthNavigator";
import HomeNavigator from "Navigation/HomeTabNavigator";
import * as SplashScreen from "expo-splash-screen";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { BellAlertIcon } from "react-native-heroicons/outline";
import { AnimatedAppLoader } from "Theme/AnimatedSplashScreen";
import { storage } from "Hooks/useStorage";
import MainStackNavigator from "Navigation/MainStackNavigator";

let splashBackground = "#fff";

try {
  const savedThemeString = storage.getString("themePreference");
  splashBackground = savedThemeString === "darkTheme" ? "#181a1c" : "#fff";
} catch (error) {
  console.error("Failed to parse theme from storage:", error);
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00b7ff7b",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

async function updateBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);

  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const navigationRef = createRef<any>();
  const [notificationScreen, setNotificationScreen] = useState("all");

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    updateBadgeCount(0);
  }, []);

  useEffect(() => {
    if (notification) {
      Toast.show({
        type: "success",
        text1: notification.request.content.title,
        text2: notification.request.content.body,
      });
    }
  }, [expoPushToken, notification]);

  const handleReady = () => {
    setIsReady(true);
    SplashScreen.hideAsync();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AnimatedAppLoader isReady={isReady} splashBackground={splashBackground}>
        <RecoilRoot>
          <MainStackNavigator
            expoPushToken={expoPushToken}
            onDataLoaded={handleReady}
            notification={notification}
            notificationScreen={notificationScreen}
          />
        </RecoilRoot>
      </AnimatedAppLoader>
    </GestureHandlerRootView>
  );
}

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#1eff00",
        borderRadius: 8,
        marginTop: 5,
        // overflow: "hidden",
        // borderBottomRightRadius: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#f2f2f2",
        // overflow: "hidden",
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#474747",
      }}
      text2Style={{
        fontSize: 12,
        color: "#6e6e6e",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ff0000",
        borderRadius: 8,
        marginTop: 5,
        // overflow: "hidden",
        // borderBottomRightRadius: 12,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#ffe8e8",
        // overflow: "hidden",
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#474747",
      }}
      text2Style={{
        fontSize: 12,
        color: "#6e6e6e",
      }}
    />
  ),
  notification: (props) => (
    <BaseToast
      {...props}
      position="bottom"
      style={{
        borderLeftColor: "#007BFF", // Custom color for notification type
        borderRadius: 8,
        marginBottom: 5, // Adjust margin to ensure visibility at the bottom
        width: "90%", // Set width to fit content within a reasonable space
        alignSelf: "center", // Center toast at the bottom
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#f8fcfd", // Light blue background for a notification look
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#003a60", // Dark blue for text
      }}
      text2Style={{
        fontSize: 12,
        color: "#007BFF", // Lighter blue for secondary text
      }}
      leadingIcon={<BellAlertIcon color={"#FFF"} size={30} />} // Optional icon
      trailingIcon={<BellAlertIcon color={"#FFF"} size={30} />} // Optional icon
    />
  ),
};

// notificationListener.current =
//   Notifications.addNotificationReceivedListener((notification) => {
//     setNotification(notification);
//   });

// responseListener.current =
//   Notifications.addNotificationResponseReceivedListener((response) => {
//     console.log("Response: ", response);
//     const data = response.notification.request.content.data;
//     const screen = data.screen;
//     setNotificationScreen(screen)
//   });

// return () => {
//   notificationListener.current &&
//     Notifications.removeNotificationSubscription(
//       notificationListener.current
//     );
//   responseListener.current &&
//     Notifications.removeNotificationSubscription(responseListener.current);
// };
