import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  callout: {
    minWidth: 250,
    maxWidth: 300,
    paddingHorizontal: 5,
    paddingVertical: 5,
    // backgroundColor: "white",
    borderRadius: 10,
    borderColor: "grey",
    borderWidth: 0.5,
  },
  calloutView: {
    alignItems: "center",
    justifyContent: "center",
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  iconContainer: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 255, 255, 0.605)",
    borderRadius: 14,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pinDrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
});
