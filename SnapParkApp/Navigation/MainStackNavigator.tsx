import { useState, useEffect, createRef } from "react";
import { StatusBar } from "react-native";
import {
  NavigationContainer,
  CommonActions,
  LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "Navigation/AuthNavigator";
import {
  lightTheme,
  darkTheme,
  lightNavTheme,
  darkNavTheme,
} from "Theme/theme";
import MissingFromOffice from "Screens/Home/MissingFromOffice/MissingFromOffice";
import { View, ActivityIndicator, Text } from "react-native";
import * as Linking from "expo-linking";
import useFetchUserDetails from "Hooks/useFetchUserDetails";
import auth from "@react-native-firebase/auth";
import { COLORS } from "Theme/theme";
import { useRecoilState } from "recoil";
import {
  themeState,
  pushNotificationToken,
  existsInOfficeState,
  initialParams,
} from "Hooks/RecoilState";
import HomeDrawer from "./DrawerNavigator";
import NoUserDrawer from "./NoUserNavigator";
import NoUserScanScreen from "Screens/NoUser/NoUserScan";
import NoUserSpotScreen from "Screens/NoUser/NoUserSpot";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { BellAlertIcon } from "react-native-heroicons/outline";

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL("/");

export default function MainStackNavigator({
  expoPushToken,
  onDataLoaded,
  notification,
  notificationScreen,
}) {
  const [initialRoute, setInitialRoute] = useState("Auth"); // Default to "Auth"
  const [theme, setTheme] = useRecoilState(themeState);
  const [_, setExpoPushToken] = useRecoilState(pushNotificationToken);
  const [initialParameters, setInitialParameters] =
    useRecoilState(initialParams);
  const [initializing, setInitializing] = useState(true);
  const [officeDataLoaded, setOfficeDataLoaded] = useState(false);

  const [userId, setUserId] = useState(null);
  const [existsInOfficeList, setExistsInOfficeList] =
    useRecoilState(existsInOfficeState);

  const navigationRef = createRef<any>();

  useEffect(() => {
    const fetchInitialUrl = async () => {
      const url = await Linking.getInitialURL();
    };

    fetchInitialUrl();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url.includes("register")) {
        console.log(url);
        const params = url.split("register")[1];
        const companyID = params.split("/")[1];
        const officeID = params.split("/")[2];
        const linkingCode = params.split("/")[3];
        const initialObj = { companyID, officeID, linkingCode };
        console.log(initialObj);
        setInitialParameters(initialObj);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: ["https://snappark.co", "snappark://"],
    config: {
      screens: {
        Auth: {
          screens: {
            AuthHome: "auth",
            Confirm: "confirm",
            Mobile: "mobile",
            EnterName: "enter-name",
            Register: "register/:userID?/:officeID?/:linkingCode?",
            Login: "login/:userID?/:officeID?",
          },
        },

        HomeDrawer: {
          initialRouteName: "Home",
          screens: {
            Home: {
              screens: {
                AllSpots: "all/:userID?/:officeID?",
                Spot: "spot/:userID?/:officeID?/:spotID?",
                Scan: "scan",
                Settings: "settings/:confirmDelete?",
                Map: "map",
              },
            },
          },
        },
      },
    },
  };

  const {
    userDetails,
    officeData,
    loading,
    error,
    needsOnboarding,
    didntFindUserInOffice,
  } = useFetchUserDetails(onDataLoaded, setOfficeDataLoaded); // Fetch user details here

  useEffect(() => {
    setExistsInOfficeList(!didntFindUserInOffice);
  }, [didntFindUserInOffice]);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      if (!user) {
        console.log("Not logged in");

        navigationRef.current?.dispatch(
          CommonActions.reset({
            index: 1,
            routes: [{ name: "Auth" }],
          })
        );
        setUserId(null);
        setInitialRoute("Auth");
        setInitializing(false);
        onDataLoaded();
      } else {
        if (needsOnboarding) {
          setInitialRoute("NoUserDrawer");
        } else {
          setInitialRoute("HomeDrawer");
        }
        if (initializing) setInitializing(false);
      }
    });
    return () => subscriber();
  }, [initializing, needsOnboarding]);

  useEffect(() => {
    if (expoPushToken) {
      setExpoPushToken(expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (!initializing && !loading && userDetails && officeDataLoaded) {
      console.log(officeDataLoaded);
      console.log("Success!");
      onDataLoaded();
    } else if (needsOnboarding) {
      console.log("Error, needs onboarding");
      setInitialRoute("Auth");
      onDataLoaded();
    }
  }, [initializing, loading, userDetails, officeData, needsOnboarding]);

  if (initializing || loading)
    return (
      <View className="flex-1 w-full items-center justify-center">
        <ActivityIndicator size={"large"} color={COLORS.primary} />
      </View>
    );

  return (
    <NavigationContainer
      // key={theme}
      ref={navigationRef}
      theme={theme === lightTheme ? lightNavTheme : darkNavTheme}
      linking={linking}
    >
      <StatusBar
        barStyle={theme !== lightTheme ? "light-content" : "dark-content"}
        animated={true}
        backgroundColor={
          theme !== lightTheme ? theme.background : theme.background
        }
      />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Group>
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              headerShown: false,

              animationTypeForReplace: "push",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen name="HomeDrawer" component={HomeDrawer} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name="NoUserDrawer" component={NoUserDrawer} />
          <Stack.Screen name="NoUserScan" component={NoUserScanScreen} />
          <Stack.Screen name="NoUserSpot" component={NoUserSpotScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: "modal" }}>
          <Stack.Screen name="Missing" component={MissingFromOffice} />
        </Stack.Group>
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </NavigationContainer>
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
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ff0000",
        borderRadius: 8,
        marginTop: 5,

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
        borderLeftColor: "#007BFF",
        borderRadius: 8,
        marginBottom: 5, 
        width: "90%",
        alignSelf: "center",
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        backgroundColor: "#f8fcfd", 
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#003a60", 
      }}
      text2Style={{
        fontSize: 12,
        color: "#007BFF", 
      }}
      leadingIcon={<BellAlertIcon color={"#FFF"} size={30} />} 
      trailingIcon={<BellAlertIcon color={"#FFF"} size={30} />} 
    />
  ),
};
