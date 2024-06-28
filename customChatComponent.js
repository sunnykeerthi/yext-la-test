import { LightningElement, track, api, wire } from "lwc";
import IMAGE from "@salesforce/resourceUrl/ChatBot";
const SF_URL =
  "https://d.la1-core1.sfdc-y37hzm.salesforceliveagent.com/chat/rest";
const YEXT_URL = "https://sbx-cdn.yextapis.com/v2/accounts/me";
export default class CustomChatComponent extends LightningElement {
  @api recordId;
  searchResults = [];
  searchTerm = "";
  @api imageUrl = IMAGE;
  showSpace = true;
  showSpinner = false;
  messages = [];
  userMessage = "";
  isLiveAgent = true;

  handleKeyDown(event) {
    if (event.keyCode === 13) {
      this.userMessage = event.target.value;
      this.messages.push({
        type: "USER",
        message: event.target.value,
        index: new Date()
      });
      this.searchTerm = "searchTerm";
      this.showSpinner = true;
      this.searchResults = [];
      !this.isLiveAgent
        ? this.getBotResponse(event.target.value)
        : this.transferToLiveAgent();
    }
  }

  async getBotResponse(input) {
    const myHeaders = new Headers();
    myHeaders.append("api-key", "myAPIKey");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      messages: [
        {
          timestamp: "1683559587573",
          source: "USER",
          text: input
        }
      ]
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw
    };

    const _req = await fetch(
      `${YEXT_URL}/chat/salesforce-live-agent-chat/message?v=20230101`,
      requestOptions
    );
    const { response, meta } = await _req.json();
    this.showSpinner = false;
    this.searchTerm = "";
    if (meta.errors.length >= 1) {
      this.messages.push({
        type: "BOT",
        message: meta.errors[0],
        index: new Date()
      });
    } else if (response.message) {
      this.messages.push({
        type: "BOT",
        message: response.message.text,
        index: new Date()
      });
      if (response.notes.currentGoal === "transfer-to-agent") {
        this.isLiveAgent = true;
      }
    }
  }
  async transferToLiveAgent() {
    this.initChat();
  }

  async initChat() {
    console.log(`enterd2`);
    const myHeaders = new Headers();
    myHeaders.append("X-LIVEAGENT-AFFINITY", "null");
    myHeaders.append("X-LIVEAGENT-API-VERSION", "57");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${SF_URL}/System/SessionId/`, requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));
  }
}
