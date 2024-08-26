import { useEffect, useRef } from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import auth from "@react-native-firebase/auth";
import HomeTabNavigator from "./HomeTabNavigator";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";
import * as Notifications from "expo-notifications";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, FontAwesome } from "@expo/vector-icons";
import {
  ArrowLeftEndOnRectangleIcon,
  ShieldCheckIcon,
} from "react-native-heroicons/outline";
import Toast from "react-native-toast-message";
import Instructions from "Screens/About/Instructions";
import ExternalLinkOpener from "Screens/Reusable/LinkOpener";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const theme = useRecoilValue(themeState);
  const user = auth().currentUser;

  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        props.navigation.navigate("Auth", { screen: "AuthHome" });
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  if (!user) {
    return null;
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={{
          padding: 15,
          paddingLeft: 16,
          display: "flex",
          flexDirection: "row",
          borderBottomWidth: 1,
          marginBottom: 7,
          borderColor: theme.border,
        }}
      >
        <FontAwesome
          name="user-circle-o"
          size={24}
          color={theme.text}
          style={{ marginRight: 15 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: theme.text }}>
          {user?.displayName}
        </Text>
      </View>
      <View style={{ display: "flex", flex: 1, height: "100%" }}>
        <DrawerItemList {...props} />
      </View>
      <View
        style={{
          display: "flex",

          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          borderWidth: 1,
          borderRadius: 10,
          borderColor: theme.border,
          marginHorizontal: 15,
          padding: 10,
          marginBottom: 5,
        }}
      >
        <Text style={{ color: theme.appVersion }}>App Version</Text>
        <Text style={{ color: theme.appVersion }}>1.1.0</Text>
      </View>
      <View
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 28,
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity onPress={handleSignOut}>
          <LinearGradient
            colors={theme.secondaryGradient}
            style={styles.gradient}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0.5 }}
          >
            <ArrowLeftEndOnRectangleIcon size={20} color={"white"} />
            <Text style={[styles.buttonText, { color: "white" }]}>
              Sign Out
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const HomeDrawer = ({ navigation }) => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(notification);
        Toast.show({
          type: "success",
          text1: notification.request.content.title,
          text2: notification.request.content.body,
        });
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        const screen = data.screen;

        if (screen === "map") {
          navigation.navigate("Map");
        } else {
          navigation.navigate("AllSpots");
        }
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={HomeTabNavigator}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Feather
              name="home"
              size={20}
              color={color}
              style={{ marginRight: -15 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="How it works"
        component={Instructions}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Feather
              name="info"
              size={20}
              color={color}
              style={{ marginRight: -15 }}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Privacy Policy"
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <ShieldCheckIcon
              size={20}
              color={color}
              style={{ marginRight: -15 }}
            />
          ),
        }}
      >
        {() => <ExternalLinkOpener url="https://snappark.co/privacy-policy" />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Terms & Conditions"
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Feather
              name="link"
              size={20}
              color={color}
              style={{ marginRight: -15 }}
            />
          ),
        }}
      >
        {() => (
          <ExternalLinkOpener url="https://snappark.co/terms-and-conditions" />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
};

export default HomeDrawer;

export const styles = StyleSheet.create({
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  gradient: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",

    borderRadius: 12,
    padding: 12,
    paddingVertical: 16,

    position: "relative",
  },
});

