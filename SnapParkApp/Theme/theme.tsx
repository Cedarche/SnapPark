import { DefaultTheme, DarkTheme } from "@react-navigation/native";

export const lightTheme = {
  primary: "#4F46E5",
  heading: "black",
  keyboard: "light",
  background: "rgb(246, 246, 246)",
  container: "#fff",
  text: "black",
  border: "lightgrey",
  card: "#fdfdfd",
  shadowColor: "grey",
  error: "#D32F2F",
  modalBackground: "#eaeaea",
  modalBorder: "lightgrey",
  infoText: "#4b4b4b",
  badge: "#cccccc39",
  // landingContainer: '-webkit-linear-gradient(135deg, #bcbbbd, #fbfbfb)',
  receiptContainer: ["#e9e9e9", "#ececec"],
  infoGradient: ["#e9e9e9", "#ffffff"],
  inputText: "#8e8e8e",
  inputBackground: "#ffffff",
  blue1: "#00b3ff",
  blue2: "#0066ff",
  primaryGradient: ["#6366F1", "#4F46E5"],
  secondaryGradient: ["#0066ff", "#00b3ff"],
  loginSocialGradient: ["#b7b7b7", "#e6e6e6ff"],
  cardButtonContainer: "#d4d4d4",
  success: "#2bff00",
  inputBorder: "grey",
  mobileText: "#0066ff",
  selectedPinColor: "#ff4800",
  pinColor: "#006aff",
  officePinColor: "#4800ff",
  addPinColor: "#0033ff",
  listBorder: "lightgrey",
  appVersion: "#848484",
  icon: "#373737",
  divider: "#848484",
  grey: "#bfbdbd",
  socialBorder: "#00b3ff",
  warning: '#ffaa00',
  modalOverlay: "rgba(199, 41, 41, 0.676)"

};

export const darkTheme = {
  primary: "#4F46E5",
  keyboard: "dark",
  background: "#181a1c",
  container: "rgb(36, 37, 42)",
  text: "#e1e8ee",
  border: "#474544",
  card: "#242529ff",
  shadowColor: "black",
  heading: "#2471ff",
  error: "#EF9A9A",
  modalBackground: "#484848",
  modalBorder: "grey",
  infoText: "#ffffff",
  badge: "#424242",
  // landingContainer: '-webkit-linear-gradient(135deg, #363537, #4b4b4b)',
  receiptContainer: ["#363537", "#4b4b4b"],
  infoGradient: ["#363537", "#5a5a5a"],
  inputText: "#a0a0a0",
  inputBackground: "#535353",
  blue1: "#00b3ff",
  blue2: "#0066ff",
  //   primaryGradient: ['#6366F1', '#4F46E5'],
  primaryGradient: ["#4F46E5", "#6366F1"],
  secondaryGradient: ["#0066ff", "#00b3ff"],
  mobileText: "#0066ff",
  loginSocialGradient: ["#363537", "#4b4b4b"],
  cardButtonContainer: "#505050",
  success: "#248810",
  inputBorder: "#d1d5db",
  // selectedPinColor: "#00ff26",
  selectedPinColor: "#ff4800",

  pinColor: "#00aaff",
  officePinColor: "#ffffff",
  addPinColor: "#00ffd9",
  listBorder: "#454545",
  appVersion: "#b5b5b5",
  icon: "#007bff",
  divider: "#8e8e8e",
  grey: "#bfbdbd",
  socialBorder: "#003c96",
  warning: '#ffaa00',
  modalOverlay: "rgba(0, 0, 0, 0.676)"

};

export const lightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: lightTheme.background,
    text: lightTheme.text,
    card: lightTheme.card,
    container: lightTheme.container,
    // border: lightTheme.border,
    shadowColor: lightTheme.shadowColor,
    heading: lightTheme.heading,
    error: lightTheme.error,
    // ... other theme properties
  },
};

export const darkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: darkTheme.background,
    text: darkTheme.text,
    card: darkTheme.card,
    container: darkTheme.container,
    // border: darkTheme.border,
    shadowColor: darkTheme.shadowColor,
    heading: darkTheme.heading,
    error: darkTheme.error,
    // ... other theme properties
  },
};

export const COLORS = {
  white: "#fff",
  //background1: '#152937',
  background1: "#fff",
  //background1: '#fff',
  //background1: '#000031',
  background2: "#000031",
  primary: "#4F46E5",
  mobileText: "#0066ff",

  secondary: "#3198EF",
  grad1: "#3198EF",
  grad2: "#4F46E5",

  greengrad1: "#00F442",
  greengrad2: "#3FC9FC",

  colorprimary100: "#FEF1D6",
  colorprimary200: "#FEDEAD",
  colorprimary300: "#FDC785",
  colorprimary400: "#FCB066",
  colorprimary500: "#FB8B34",
  colorprimary600: "#D76926",
  colorprimary700: "#B44C1A",
  colorprimary800: "#913310",
  colorprimary900: "#782109",

  grey: "#bfbdbd",
  lightGrey: "#e1e8ee",
  darkGrey: "#202733",
  card: "#e1e8ee",

  blue1: "#00b3ff",
  blue2: "#0066ff",

  completeGradient1: "#00ff8f",
  completeGradient2: "#00a1ff",
};
