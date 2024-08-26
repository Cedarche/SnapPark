import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useRecoilValue } from "recoil";
import { themeState } from "Hooks/RecoilState";

interface GradientTextProps {
  title: string;
  textStyle?: TextStyle;
  gradientColors?: string[];
}

export const GradientText: React.FC<GradientTextProps> = ({
  title,
  textStyle,
  gradientColors = ["#FF2121", "#FF9921"],
}) => {
  return (
    <MaskedView
      style={[textStyles.maskedView, { minHeight: textStyle.fontSize }]}
      maskElement={
        <View style={textStyles.maskView}>
          <Text style={[textStyles.buttonText, textStyle]}>{title}</Text>
        </View>
      }
    >
      <LinearGradient
        colors={gradientColors}
        style={textStyles.gradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
      />
    </MaskedView>
  );
};

const textStyles = StyleSheet.create({
  maskedView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  maskView: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
  },
});

interface GradientBorderButtonProps {
  onPress: () => void;
  title: string;
  textStyle?: TextStyle;
  gradientColors?: string[];
  fill?: boolean;
  width?: any;
  style?: {};
  loading?: boolean;
  loadingColor?: string;
  disabled?: boolean;
}

export const GradientBorderButton: React.FC<GradientBorderButtonProps> = ({
  onPress,
  title,
  textStyle,
  gradientColors = ["#FF2121", "#FF9921"],
  fill,
  width = Dimensions.get("window").width * 0.8,
  style, // Add a style prop
  loading,
  loadingColor,
  disabled = false,
}) => {
  const bg = useRecoilValue(themeState);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
      style={[
        buttonStyles.buttonContainer,
        { width: width },
        disabled ? { opacity: 0.5 } : {}, // Conditionally apply reduced opacity
        style, // Ensure additional styles can still be applied
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={buttonStyles.gradient}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 1 }}
      >
        <View
          style={
            fill
              ? [
                  buttonStyles.innerContainer,
                  { backgroundColor: bg.background },
                ]
              : null
          }
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={loadingColor} />
          ) : (
            <Text style={[buttonStyles.buttonText, textStyle]}>{title}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",

    height: 50,
    marginBottom: 10,
    shadowOpacity: 0.2,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "grey",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderRadius: 10,
  },
  innerContainer: {
    backgroundColor: "#202733",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9,
    position: "absolute",
    top: 1,
    bottom: 1,
    left: 1,
    right: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
  },
});
