// exports.keepAlive = functions
//   .region("europe-west1")
//   .pubsub.schedule("*/3 * * * *") // Runs every 3 minutes
//   .timeZone("UTC") // Ensure that the timezone is set if needed
//   .onRun(async (context) => {
//     const aliveRef = admin.firestore().collection("keepAlive").doc("keepAlive");

//     try {
//       await aliveRef.update({
//         value: admin.firestore.FieldValue.increment(1),
//       });
//     } catch (error) {
//       console.error("Error resetting parking spots hourly: ", error);
//     }
//   });