import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import Wrapper from "Screens/Reusable/Wrapper";
import { LinearGradient } from "expo-linear-gradient";
import { useRecoilState, useRecoilValue } from "recoil";
import { themeState, userState, officeState } from "Hooks/RecoilState";
import { OfficeData } from "Hooks/Types";
import { ExclamationTriangleIcon } from "react-native-heroicons/outline";
import { GradientBorderButton } from "Screens/Reusable/GradientComponents";

const NoOffice = ({ navigation }) => {
  const theme = useRecoilValue(themeState);

  const handleScanPress = () => {
    navigation.navigate("NoUserScan");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ width: "100%", display: "flex", flex: 1 }}
        onPress={handleScanPress}
      >
        <LinearGradient
          style={[styles.stepContainer, { borderColor: theme.border }]}
          colors={theme.infoGradient}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.stepIconContainer}>
            <ExclamationTriangleIcon size={45} color={theme.blue2} />
          </View>
          <View style={styles.stepInfoContainer}>
            <Text style={[styles.displayName, { color: theme.text }]}>
              Nothing to show yet!
            </Text>
            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 15, color: theme.infoText }}>
                Press here to scan a parking spot QR code.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ display: "flex",  minWidth: "100%", alignItems: 'center', justifyContent: 'center' }}>
        <GradientBorderButton
          onPress={handleScanPress}
          title="Scan QR Code"
          gradientColors={theme.primaryGradient}
          fill={false}
          textStyle={{ color: "#fff" }}
          style={{ width: '95%', marginHorizontal: 20 }}
        />
      </View>
    </View>
  );
};

export default NoOffice;

export const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    width: '100%'
  }, 
  stepContainer: {
    display: "flex",
    position: "relative",
    borderWidth: 1,
    // flex: 1,
    // minHeight: '50%',
    alignItems: "center",
    // flexDirection: "column",
    // justifyContent: "center",
    // width: "100%",
    margin: 8,
    // borderWidth: 1,
    borderRadius: 12,
    padding: 25,

    // paddingVertical: 30,
  },
  stepIconContainer: {
    display: "flex",

    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepInfoContainer: { display: "flex", alignItems: "center" },
  displayName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
