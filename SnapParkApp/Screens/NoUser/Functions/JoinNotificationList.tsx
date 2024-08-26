import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/functions";
import { CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";


const user = auth().currentUser;

export async function joinNotificationList(
  navigation,
  setLoading,
  name,
  userData,
  officeData
) {
  setLoading(true);
  try {
    console.log(name);
    if (!name) {
      Toast.show({
        type: "error",
        text1: "Insufficent details",
        text2: "Please enter a name and try again.",
      });
      setLoading(false);
      return;
    }

    if (!user || !officeData || !userData) {
      Toast.show({
        type: "error",
        text1: "Something went wrong...",
        text2: "Please try again.",
      });
      setLoading(false);
      return;
    }

    if (!user.displayName) {
      await user.updateProfile({
        displayName: name,
      });
    }

    const newEmployee = {
      ...userData,
      name: name,
      mobile: Math.floor(Math.random() * 1000000000),
    };

    const addToNotificationList = firebase
      .app()
      .functions("europe-west1")
      .httpsCallable("addToNotificationList");

    const result = await addToNotificationList({
      userId: officeData.companyID,
      officeId: officeData.officeID,
      newEmployee,
    });

    console.log("Function result:", result.data);

    // console.log(newEmployee);
    setLoading(false);

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "HomeDrawer" }],
      })
    );
  } catch (error) {
    console.log("Something went wrong...", error);
    setLoading(true);
  } finally {
    setLoading(false);
  }
}
