import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { themeState, userState } from "Hooks/RecoilState";
import { useRecoilValue } from "recoil";
import Reauthenticate from "./Reauthenticate";
import { XCircleIcon } from "react-native-heroicons/outline";
import auth from "@react-native-firebase/auth";
import { CommonActions } from "@react-navigation/native";
import { firebase } from "@react-native-firebase/functions";
import Toast from "react-native-toast-message";

const DeleteAccount = ({ showModal, setShowModal, navigation }) => {
  const theme = useRecoilValue(themeState);
  const [reauth, setReauth] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const userDetails = useRecoilValue(userState);
  const [noMobile, setNoMobile] = useState(false);

  const user = auth().currentUser;

  const handleSignOut = () => {
    auth()
      .signOut()
      .then(() => {
        console.log("User signed out!");
        // Try a direct navigation to 'AuthHome' after sign out
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          })
        );
        // navigation.navigate("Auth", { screen: "AuthHome" });
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const handleCancel = () => {
    setShowModal(false);
    setReauth(false);
    setNoMobile(false);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      const user = auth().currentUser;

      if (!user) {
        throw new Error("No user is currently signed in.");
      }

      const userId = userDetails.company;
      const officeId = userDetails.office;
      const mobile = user.phoneNumber || null;
      const email = user.email || null;
      const employeeUID = user.uid;

      console.log("Attempting to remove from the notification list");

      const removeFromNotificationList = firebase
        .app()
        .functions("europe-west1")
        .httpsCallable("removeFromNotificationList");

      await removeFromNotificationList({
        userId: userId,
        officeId: officeId,
        mobile,
        employeeUID,
      });

      console.log(
        "Removed from notification list. Proceeding with account deletion."
      );

      const deleteEmployeeAccount = firebase
        .app()
        .functions("europe-west1")
        .httpsCallable("deleteEmployeeAccount");

      auth()
        .signOut()
        .then(() => {
          console.log("User signed out!");
          // Try a direct navigation to 'AuthHome' after sign out

          // navigation.navigate("Auth", { screen: "AuthHome" });
        })
        .catch((error) => {
          console.error("Sign out error:", error);
        });

      const result = await deleteEmployeeAccount({
        userID: employeeUID,
      });

      if (result.data.success) {
        console.log("User account deleted successfully!");

        Toast.show({
          type: "success",
          text1: "Account Deleted",
          text2: "Your account has been deleted successfully.",
        });

        setIsLoading(false);
        setShowModal(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          })
        );
      }
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        console.error(
          "The user needs to re-authenticate before deleting the account."
        );
        setIsLoading(false);
        try {
          if (user.phoneNumber) {
            const confirmation = await auth().signInWithPhoneNumber(
              auth().currentUser.phoneNumber
            );
            setVerificationId(confirmation.verificationId);
            setReauth(true);
          } else {
            setNoMobile(true);
          }
        } catch (sendError) {
          console.error("Error sending verification code: ", sendError);
        }
      } else {
        console.error("User deletion error: ", error);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          })
        );
      }
    }
  };

  const handleReauthenticate = async (otp) => {
    setIsLoading(true);
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      await auth().currentUser.reauthenticateWithCredential(credential);
      console.log("User re-authenticated successfully!");
      await handleConfirmDelete();
    } catch (error) {
      console.error("Error re-authenticating user: ", error);
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={showModal}
      animationType="fade"
      transparent={true}
      hardwareAccelerated={true}
    >
      <View style={styles.centeredView}>
        <View
          style={[
            styles.modalView,
            {
              backgroundColor: theme.background,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          {reauth ? (
            <Reauthenticate
              handleCancel={handleCancel}
              handleConfirmDelete={handleReauthenticate}
              isLoading={isLoading}
            />
          ) : noMobile ? (
            <View style={{ display: "flex", position: "relative" }}>
              <TouchableOpacity
                style={{ position: "absolute", top: 0, right: 0, zIndex: 50 }}
                onPress={() => handleCancel()}
              >
                <XCircleIcon size={26} color={theme.text} />
              </TouchableOpacity>
              <View>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: theme.text,
                    fontSize: 22,
                    marginBottom: 14,
                  }}
                >
                  Please reauthenticate
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    marginBottom: 14,
                    textAlign: "left",
                  }}
                >
                  It's been a while since you've been reauthenticated, please
                  sign out first then return here to try again.
                </Text>
              </View>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: "#ff0000" }}
                className="min-w-full min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
                onPress={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Text
                    className="text-[17px] font-bold"
                    style={{ color: "#fff" }}
                  >
                    Sign Out
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, borderColor: theme.blue2 }}
                className="min-w-full border min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
                onPress={() => {
                  setShowModal(false);
                  setNoMobile(false);
                }}
              >
                <Text
                  className="text-[17px] font-bold"
                  style={{ color: theme.blue2 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ display: "flex", position: "relative" }}>
              <TouchableOpacity
                style={{ position: "absolute", top: 0, right: 0, zIndex: 50 }}
                onPress={() => handleCancel()}
              >
                <XCircleIcon size={26} color={theme.text} />
              </TouchableOpacity>
              <View>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: theme.text,
                    fontSize: 22,
                    marginBottom: 14,
                  }}
                >
                  Delete Account
                </Text>
                <Text
                  style={{
                    color: theme.text,
                    fontSize: 16,
                    marginBottom: 14,
                    textAlign: "left",
                  }}
                >
                  Are you sure you want to delete your account? You will no
                  longer receive any notifications. This cannot be undone.{" "}
                </Text>
              </View>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: "#ff0000" }}
                className="min-w-full min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
                onPress={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size={"small"} color={"#fff"} />
                ) : (
                  <Text
                    className="text-[17px] font-bold"
                    style={{ color: "#fff" }}
                  >
                    Confirm Delete
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, borderColor: theme.blue2 }}
                className="min-w-full border min-h-[50] max-h-[50] mt-2 rounded-xl items-center justify-center"
                onPress={() => setShowModal(false)}
              >
                <Text
                  className="text-[17px] font-bold"
                  style={{ color: theme.blue2 }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DeleteAccount;

const styles = StyleSheet.create({
  inputContainer: {
    width: "100%",
    height: 48, 
    paddingHorizontal: 16, 
    borderWidth: 1, 

    borderRadius: 8,
    justifyContent: "flex-start", 
    marginVertical: 8, 
  },
  centeredView: {
    flex: 1,
    paddingBottom: 100,

    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%", 
    maxWidth: 400,
    display: "flex",

    borderRadius: 20, 
    padding: 20, 
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Only affects Android
  },
});
