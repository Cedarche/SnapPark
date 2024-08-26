import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthHome from "Screens/Auth/AuthHome";
import ConfirmOTP from "Screens/Auth/ConfirmOTP";
import EnterName from "Screens/Auth/EnterName";
import LoginScreen from "Screens/Auth/Login/LoginScreen";
import RegisterScreen from "Screens/Auth/Register/Register";
import MobileScreen from "Screens/Auth/Login/MobileScreen";
const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AuthHome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AuthHome" component={AuthHome} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Mobile" component={MobileScreen} />

      <Stack.Screen name="Confirm" component={ConfirmOTP} />
      <Stack.Screen name="EnterName" component={EnterName} />
    </Stack.Navigator>
  );
}
