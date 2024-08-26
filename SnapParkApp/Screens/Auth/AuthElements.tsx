import { StyleSheet } from "react-native";
import { COLORS } from "../../Theme/theme";

export const styles = StyleSheet.create({
  center: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1.2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
  },

  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  headingContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },

  titleText: {
    fontSize: 55,
    color: COLORS.primary,
  },

  inputContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    marginTop: 25,
    paddingHorizontal: 1,
  },

  input: {
    display: "flex",
    width: "90%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grey,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "darkgrey",
    padding: 12,
    shadowOpacity: 0.4,
    elevation: 1,
    marginVertical: 5,
  },

  button: {
    display: "flex",
    width: "90%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "grey",
    shadowOpacity: 0.6,
    elevation: 2,
    marginVertical: 5,
  },

  linear: {
    display: "flex",
    borderRadius: 15,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Metropolis-800",
  },

  preloader: {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background1,
  },
  HeadingSubContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    // marginBottom: 20,
  },

  Divider: {
    display: "flex",
    flex: 1,
    marginHorizontal: 15,

    borderBottomWidth: 1,
    borderColor: "lightgrey",
  },

  SocialsContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
  },

  SocialSubContainer: {
    display: "flex",
    flexDirection: "row",
    marginVertical: 30,
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
  },

  Social: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    height: 50,
    width: 80,
    borderRadius: 8,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 2,
    overflow: "hidden",
    borderWidth: 1,
  },

  SocialImg: {
    width: "35%",
    height: undefined,
    aspectRatio: 1,
  },

  incorrectDetails: {
    color: "red",
    paddingVertical: 5,
  },

  // MobileScreen components ==================================
  subContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
    // borderWidth: 1,
  },

  mobileHeading: {
    fontSize: 25,
    paddingLeft: 20,
  },

  mobileInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    width: "90%",
    height: 50,
    backgroundColor: "white",
    borderRadius: 22,
    // borderWidth: 1,
    borderColor: COLORS.mobileText,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "grey",
    paddingLeft: 25,
    shadowOpacity: 0.2,
    elevation: 2,
    marginVertical: 5,
  },

  sendCodeButton: {
    display: "flex",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    borderRadius: 22,
  },

  explanationText: {
    fontSize: 14,
    color: "grey",
    marginVertical: 15,
  },

  // Code input styles --------------------
  codeInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "60%",
    height: 55,
    backgroundColor: "white",
    borderRadius: 22,
    // borderWidth: 1,
    borderColor: COLORS.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "grey",
    shadowOpacity: 0.6,
    elevation: 2,
    marginVertical: 5,
  },
});
