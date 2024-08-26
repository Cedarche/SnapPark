import * as functions from "firebase-functions";
import axios from "axios";

export async function sendTextMessages(
  message: string,
  numbers: string[],
): Promise<void> {
  const clickSendEndpoint = "https://rest.clicksend.com/v3/sms/send";
  const clickSendUsername = functions.config().clicksend.username;
  const clickSendApiKey = functions.config().clicksend.apikey;

  const smsPayload = {
    messages: numbers.map((number) => ({
      source: "sdk",
      from: "SNAPPARK", // This might be a phone number or a sender ID depending on your ClickSend account setup
      body: message,
      to: number,
    })),
  };

  await axios.post(clickSendEndpoint, smsPayload, {
    auth: {
      username: clickSendUsername,
      password: clickSendApiKey,
    },
    headers: { "Content-Type": "application/json" },
  });
}
