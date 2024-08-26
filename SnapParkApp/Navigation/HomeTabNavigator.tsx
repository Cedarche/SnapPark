import { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  ActivityIndicator,
  Platform,
  Dimensions,
  Text,
  StyleSheet,
} from "react-native";
import AllSpots from "Screens/Home/AllSpots/AllSpotsScreen";
import ScanScreen from "Screens/Home/Scan/ScanScreen";
import SettingsScreen from "Screens/Home/Settings/SettingsScreen";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  userState,
  bottomSheetState,
  officeState,
  existsInOfficeState,
} from "Hooks/RecoilState";
import { COLORS } from "Theme/theme";
import {
  MapIcon,
  QueueListIcon,
  Cog6ToothIcon,
  ViewfinderCircleIcon,
} from "react-native-heroicons/outline";
import SpotBottomSheet from "Screens/Home/AllSpots/SpotBottomSheet";
import { useRoute, RouteProp } from "@react-navigation/native";
import { OfficeData } from "Hooks/Types";
import { SafeAreaView } from "react-native-safe-area-context";
import MapScreen from "Screens/Maps/MapScreen";

import { CommonActions } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");
const aspectRatio = height / width;

const Tab = createBottomTabNavigator();

export default function HomeTabNavigator({ navigation }) {
  const userDetails = useRecoilValue(userState);
  const [spotSheetState, setSpotSheetState] = useRecoilState(bottomSheetState);
  const [officeData, setOfficeData] = useRecoilState<OfficeData>(officeState);
  const existsInNotificationList = useRecoilValue(existsInOfficeState);

  const route = useRoute<RouteProp<any>>();
  const spotID = route.params?.params?.spotID;

  useEffect(() => {
    if (!existsInNotificationList) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Missing" }],
        })
      );
    }
  }, [existsInNotificationList]);

  useEffect(() => {
    if (spotID) {
      const foundSpot = officeData?.parkingSpots.find(
        (spot) => spot.name === spotID
      );
      if (foundSpot) {
        setSpotSheetState({ isOpen: true, spotData: foundSpot });
      }
    }
  }, [spotID, officeData?.parkingSpots, setSpotSheetState]);

  if (!userDetails) {
    return (
      <View className="flex-1 w-full items-center justify-center">
        <ActivityIndicator size={"small"} color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,

          tabBarStyle: {
            borderTopWidth: 0,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            height: Platform.OS == "ios" ? 85 : 65,
            paddingBottom: Platform.OS == "ios" ? 30 : 15,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 0.6,
            elevation: 5,
          },
        }}
      >
        <Tab.Screen
          name="AllSpots"
          component={AllSpots}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.tabView, { width: 100 }]}>
                <QueueListIcon
                  size={22}
                  color={focused ? `${COLORS.primary}` : "grey"}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: focused ? COLORS.primary : "grey" },
                  ]}
                >
                  Spot List
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.tabView, { width: 100 }]}>
                <ViewfinderCircleIcon
                  size={22}
                  color={focused ? `${COLORS.primary}` : "grey"}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: focused ? COLORS.primary : "grey" },
                  ]}
                >
                  Scan
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.tabView, { width: 100 }]}>
                <MapIcon
                  size={22}
                  color={focused ? `${COLORS.primary}` : "grey"}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: focused ? COLORS.primary : "grey" },
                  ]}
                >
                  Map
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={[styles.tabView, { width: 100 }]}>
                <Cog6ToothIcon
                  size={22}
                  color={focused ? `${COLORS.primary}` : "grey"}
                />
                <Text
                  style={[
                    styles.tabText,
                    { color: focused ? COLORS.primary : "grey" },
                  ]}
                >
                  Settings
                </Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      {spotSheetState.isOpen && (
        <SpotBottomSheet spotData={spotSheetState.spotData} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabView: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 15,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
});
