import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Dimensions,
    useWindowDimensions,
    Platform,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { COLORS } from "../../Theme/theme";
  import { Feather } from "@expo/vector-icons";
  import { useNavigation } from "@react-navigation/native";
  import { DrawerNavigationProp } from "@react-navigation/drawer";
  import { useRecoilValue, useRecoilState } from "recoil";
  
  import { themeState } from "Hooks/RecoilState";
  
  const { height, width } = Dimensions.get("window");
  const aspectRatio = height / width;
  
  type RootDrawerParamList = {
    Home: undefined;
    Profile: { userId: string };
    // other routes...
  };
  const Wrapper = ({ heading, children }) => {
    const window = useWindowDimensions();
    const theme = useRecoilValue(themeState);
  
    const navigation =
      useNavigation<DrawerNavigationProp<RootDrawerParamList, "Home">>();
  
    const NAV_BAR_HEIGHT_ANDROID = 12;
  
    const containerBottom =
      (heading === "How it works" || "Home")
        ? 8
        : Platform.select({
            ios: aspectRatio > 1.6 ? 62 : 70,
            android:
              aspectRatio > 1.6
                ? 62 + NAV_BAR_HEIGHT_ANDROID
                : 70 + NAV_BAR_HEIGHT_ANDROID,
          });
  
    return (
      <SafeAreaView style={[styles.wrapper]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.Heading]}>{heading}</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Feather
                name="x"
                size={25}
                color={COLORS.primary}
                style={{ paddingTop: 3 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.outerContainer]}>
          <View
            style={[
              styles.container,
              {
                borderColor: theme.border,
                backgroundColor: theme.container,
                bottom: containerBottom,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  export default Wrapper;
  
  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
  
      alignItems: "center",
    },
    headerContainer: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      alignItems: "center",
    },
    Heading: {
      fontSize: 25,
      color: COLORS.primary,
      fontWeight: "700",
      marginVertical: 10,
      marginTop: 15,
    },
    menuContainer: { flexDirection: "row", alignItems: "center" },
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
  
      borderWidth: 1,
      borderRadius: 15,
      alignItems: "center",
      overflow: "hidden",
    },
  });
  
