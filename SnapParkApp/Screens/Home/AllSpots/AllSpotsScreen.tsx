import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  userState,
  officeState,
  themeState,
  bottomSheetState,
} from "Hooks/RecoilState";
import { OfficeData } from "Hooks/Types";

import SpotList from "./SpotList";

import Wrapper from "Screens/Reusable/Wrapper";

interface NotificationSetting {
  key: keyof OfficeData["notificationSettings"];
  messageKey: keyof Omit<OfficeData, "notificationSettings">;
  type: string;
}

interface NotificationProps {
  officeData: OfficeData;
  theme: any;
}

export default function AllSpots({ route, navigation }) {
  const userDetails = useRecoilValue(userState);
  const theme = useRecoilValue(themeState);
  const [officeData, setOfficeData] = useRecoilState<OfficeData>(officeState);
  const [spotSheetState, setSpotSheetState] = useRecoilState(bottomSheetState);
  const [notifications, setNotifications] = useState<Array<any>>([]);

  const openSpotSheet = ({ spotData }) => {
    setSpotSheetState({ isOpen: true, spotData });
  };

  if (!officeData) {
    return (
      <View
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size={"small"} color={theme.primary} />
      </View>
    );
  }

  const data = officeData?.parkingSpots ?? [];

  useEffect(() => {
    const getNotificationStatusArray = (
      data: OfficeData
    ): Array<{ sent: boolean; type: string }> => {
      const settings: NotificationSetting[] = [
        { key: "fullNotification", messageKey: "messageSent", type: "All" },
        {
          key: "threeSpotsNotification",
          messageKey: "threeSpotsMessageSent",
          type: `${officeData?.notificationSettings.spotsRemainingValue} left`,
        },
        {
          key: "customSpotsNotification",
          messageKey: "customMessageSent",
          type: "Custom",
        },
      ];

      return settings
        .filter((setting) => !!data.notificationSettings[setting.key])
        .map((setting) => ({
          sent: !!data[setting.messageKey],
          type: setting.type,
        }))
        .sort((a, b) => (b.sent === a.sent ? 0 : b.sent ? 1 : -1));
    };

    setNotifications(getNotificationStatusArray(officeData));
  }, [officeData]);


  const sortedData = [...data].sort((a, b) => {
    if (a.available === b.available) {
      return 0;
    } else if (a.available && !b.available) {
      return -1;
    } else {
      return 1;
    }
  });

  return (
    <Wrapper heading="All Parking Spots">
      <View
        className="py-0 border-b  mb-3"
        style={{ borderColor: theme.border }}
      >
        <View className="w-full  p-4 pb-1 flex flex-row items-center justify-between ">
          <Text className="text-sm font-medium" style={{ color: theme.text }}>
            Company:{" "}
          </Text>
          <View
            className="inline-flex items-center rounded-md px-2 py-2 border border-gray-400
                 "
            style={{ backgroundColor: theme.badge }}
          >
            <Text
              className="text-[15px] font-medium text-gray-600"
              style={{ color: theme.infoText }}
            >
              {officeData?.company}
            </Text>
          </View>
        </View>
        <View className="w-full p-4 py-1 flex flex-row items-center justify-between ">
          <Text className="text-sm font-medium" style={{ color: theme.text }}>
            Office:{" "}
          </Text>
          <View
            className="inline-flex items-center rounded-md  px-2 py-2 border  border-gray-400
                   "
            style={{ backgroundColor: theme.badge }}
          >
            <Text
              className="text-[15px] font-medium text-gray-600"
              style={{ color: theme.infoText }}
            >
              {officeData?.office}
            </Text>
          </View>
        </View>

        <View className="w-full p-4 pt-1 flex flex-row items-center justify-between ">
          <Text className="text-sm font-medium" style={{ color: theme.text }}>
            Notifications Sent:{" "}
          </Text>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              height: 31,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: "grey",
              minWidth: 70,
              overflow: "hidden",
            }}
          >
            {notifications.map((notification, index) => (
              <View
                key={`${notification.type}-${index}`}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRightWidth:
                    index === notifications.length - 1 ? null : 1,
                  backgroundColor: notification.sent ? theme.primary : null,
                  borderColor: "grey",
                  paddingHorizontal: 8,
                  // minWidth: 50
                }}
              >
                <Text style={{ color: notification.sent ? "#fff" : "#979797" }}>
                  {notification.type}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <SpotList sortedData={sortedData} openSpotSheet={openSpotSheet} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    display: "flex",
    width: "100%",
    flex: 1,
    position: "relative",
  },
  container: {
    display: "flex",
    position: "absolute",
    flex: 1,
    top: 8,
    left: 8,
    right: 8,
    bottom: 60,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    overflow: "hidden",
  },
});
