import { View, Text, ScrollView, StyleSheet } from "react-native";
import React from "react";
import Wrapper from "Screens/Reusable/Wrapper";
import { LinearGradient } from "expo-linear-gradient";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";
import {
  FontAwesome5,
  Feather,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

const Instructions = () => {
  const theme = useRecoilValue(themeState);
  return (
    <Wrapper heading={"How it works"}>
      <ScrollView
        style={{ display: "flex", flex: 1, width: "100%", padding: 8 }}
      >
        <LinearGradient
          style={[styles.stepContainer, { borderColor: theme.border }]}
          colors={theme.infoGradient}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.stepIconContainer}>
            <MaterialCommunityIcons
              name="list-status"
              size={35}
              color={theme.pinColor}
            />
          </View>
          <View style={styles.stepInfoContainer}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              Check for availabilty
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: theme.infoText }}>
                You can use the app to check the real-time status of each
                parking spot in your work office.
              </Text>
            </View>
          </View>
          <View
            style={{ borderColor: theme.infoText }}
            className="absolute top-1 right-1 rounded-full border  flex items-center justify-center h-5 w-5"
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: theme.infoText,
              }}
            >
              1
            </Text>
          </View>
        </LinearGradient>
        <LinearGradient
          style={[styles.stepContainer, { borderColor: theme.border }]}
          colors={theme.infoGradient}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.stepIconContainer}>
            <FontAwesome5 name="parking" size={35} color={theme.pinColor} />
          </View>
          <View style={styles.stepInfoContainer}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              Grab a car park at work
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: theme.infoText }}>
                If you haven't received a 'Parking Full' notification yet, that
                means there's still spots availabile in the office.
              </Text>
            </View>
          </View>
          <View
            style={{ borderColor: theme.infoText }}
            className="absolute top-1 right-1 rounded-full border  flex items-center justify-center h-5 w-5"
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: theme.infoText,
              }}
            >
              2
            </Text>
          </View>
        </LinearGradient>
        <LinearGradient
          style={[styles.stepContainer, { borderColor: theme.border }]}
          colors={theme.infoGradient}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.stepIconContainer}>
            <MaterialIcons
              name="qr-code-scanner"
              size={35}
              color={theme.pinColor}
            />
          </View>
          <View style={styles.stepInfoContainer}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              Scan the QR code
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: theme.infoText }}>
                Each parking spot will have an associated QR code sticker.
                Simply scan the sticker to bring up the spot within the App.
              </Text>
            </View>
          </View>
          <View
            style={{ borderColor: theme.infoText }}
            className="absolute top-1 right-1 rounded-full border  flex items-center justify-center h-5 w-5"
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: theme.infoText,
              }}
            >
              3
            </Text>
          </View>
        </LinearGradient>
        <LinearGradient
          style={[styles.stepContainer, { borderColor: theme.border }]}
          colors={theme.infoGradient}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={[styles.stepIconContainer, { marginRight: 2 }]}>
            <Feather name="check-circle" size={32} color={theme.pinColor} />
          </View>
          <View style={styles.stepInfoContainer}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              Mark the spot as taken
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: theme.infoText }}>
                Each parking spot will have an associated QR code sticker.
                Simply scan the sticker to bring up the spot within the App.
              </Text>
            </View>
          </View>
          <View
            style={{ borderColor: theme.infoText }}
            className="absolute top-1 right-1 rounded-full border  flex items-center justify-center h-5 w-5"
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: theme.infoText,
              }}
            >
              4
            </Text>
          </View>
        </LinearGradient>
        <LinearGradient
          style={[styles.stepContainer, { borderColor: theme.border }]}
          colors={theme.infoGradient}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={[styles.stepIconContainer]}>
            <FontAwesome5 name="bell" size={35} color={theme.pinColor} />
          </View>
          <View style={styles.stepInfoContainer}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              Notifification sent out
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: theme.infoText }}>
                When the carpark is full, or other custom notifications are
                enabled for your office, Snap Park sends out a notification to
                all employees.
              </Text>
            </View>
          </View>
          <View
            style={{ borderColor: theme.infoText }}
            className="absolute top-1 right-1 rounded-full border  flex items-center justify-center h-5 w-5"
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: theme.infoText,
              }}
            >
              5
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </Wrapper>
  );
};

export default Instructions;

export const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    padding: 15,

    width: "100%",
  },
  stepContainer: {
    display: "flex",
    position: "relative",
    //   alignItems: "center",
    flexDirection: "row",
    // justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
    marginBottom: 8,
  },
  stepIconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 18,
  },
  stepInfoContainer: { display: "flex", flex: 1 },
  displayName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  settingsCard: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    paddingVertical: 18,
    marginBottom: 10,
    position: "relative",
  },
  settingsHeaderText: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingInfoText: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "400",
    maxWidth: "80%",
  },
  verified: {
    position: "absolute",
    top: -8,
    right: -5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  divider: {
    width: "100%",
    borderBottomWidth: 1,
    marginTop: 0,
    marginBottom: 10,
  },
  gradient: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",

    borderRadius: 12,
    padding: 15,
    paddingVertical: 18,

    position: "relative",
  },
});
