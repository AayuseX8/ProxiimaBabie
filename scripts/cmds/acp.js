const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "accept",
    aliases: ["acp"],
    version: "1.2",
    author: "Mr-perfect",
    countDown: 8,
    role: 2,
    shortDescription: "Accept users",
    longDescription: "Accept friend requests and store request data",
    category: "Utility",
    nonPrefix: true,
  },

  onStart: async function ({ event, api }) {
    return;
  },

  onChat: async function ({ event, api, commandName }) {
    if (
      event.body.toLowerCase() === "fbrequests" ||
      event.body.toLowerCase() === "acp" ||
      event.body.toLowerCase() === "accept"
    ) {
      try {
        const form = {
          av: api.getCurrentUserID(),
          fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
          fb_api_caller_class: "RelayModern",
          doc_id: "4499164963466303",
          variables: JSON.stringify({ input: { scale: 3 } }),
        };

        const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        const data = JSON.parse(response);
        if (!data.data.viewer.friending_possibilities) {
          return api.sendMessage("❌ Error retrieving friend requests. Please try again later.", event.threadID);
        }

        const listRequest = data.data.viewer.friending_possibilities.edges;
        let msg = "";
        const friendRequests = [];

        for (const user of listRequest) {
          const requestDate = moment(user.time * 1000).tz("Asia/Kathmandu");
          const userInfo = {
            name: user.node.name,
            profileLink: user.node.url.replace("www.facebook", "fb"),
            date: requestDate.format("DD/MM/YYYY"),
            time: requestDate.format("hh:mm:ss A"),
          };

          friendRequests.push(userInfo);

          msg += `------------------\n`
            + `🔹 Name: ${user.node.name}\n`
            + `🔗 Profile: ${user.node.url.replace("www.facebook", "fb")}\n`
            + `📅 Date: ${requestDate.format("DD/MM/YYYY")}\n`
            + `🕒 Time: ${requestDate.format("hh:mm:ss A")}\n`;
        }

        // ✅ Ensure the `json-files` directory exists before writing the file
        const requestDir = path.join(__dirname, "json-files");
        if (!fs.existsSync(requestDir)) {
          fs.mkdirSync(requestDir, { recursive: true });
        }

        // ✅ Write request data safely
        const requestFilePath = path.join(requestDir, "friend_requests.json");
        fs.writeFileSync(requestFilePath, JSON.stringify(friendRequests, null, 2));

        api.sendMessage(
          `${msg}\nReply to this message with: <add | del> <number | "all"> to take action.`,
          event.threadID,
          (err, info) => {
            if (err) return console.error(err);
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              listRequest,
              author: event.senderID,
              unsendTimeout: setTimeout(() => {
                api.unsendMessage(info.messageID);
              }, 20000 * 8),
            });
          },
          event.messageID
        );
      } catch (error) {
        console.error(error);
        return api.sendMessage("❌ Failed to retrieve friend requests. Please try again later.", event.threadID);
      }
    }
  },

  onReply: async function ({ message, Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;
    const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");

    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString(),
        },
        scale: 3,
        refresh_num: 0,
      },
    };

    let action = args[0];
    let targetIDs = args.slice(1);

    if (action !== "add" && action !== "del") {
      api.sendMessage("⚠️ Invalid action. Please use 'add' or 'del'.", event.threadID);
      return api.unsendMessage(messageID);
    }

    if (action === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    } else if (action === "del") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    }

    if (targetIDs[0] === "all") {
      targetIDs = [];
      for (let i = 1; i <= listRequest.length; i++) targetIDs.push(i);
    }

    if (targetIDs.length === 0) {
      api.sendMessage("⚠️ Please specify a target user (e.g., 'add 1' or 'del 2').", event.threadID);
      return api.unsendMessage(messageID);
    }

    const success = [];
    const failed = [];

    for (const stt of targetIDs) {
      const u = listRequest[parseInt(stt) - 1];
      if (!u) {
        failed.push(`⚠️ Can't find request ${stt} in the list.`);
        continue;
      }
      form.variables.input.friend_requester_id = u.node.id;
      form.variables = JSON.stringify(form.variables);

      try {
        const friendRequest = await api.httpPost("https://www.facebook.com/api/graphql/", form);
        if (JSON.parse(friendRequest).errors) {
          failed.push(u.node.name);
        } else {
          success.push(u.node.name);
        }
      } catch (e) {
        failed.push(u.node.name);
      }
    }

    let resultMessage = "";
    if (success.length > 0) {
      resultMessage += `✅ Successfully processed ${success.length} request(s):\n${success.join("\n")}\n`;
    }
    if (failed.length > 0) {
      resultMessage += `❌ Failed for ${failed.length} request(s):\n${failed.join("\n")}`;
    }

    api.sendMessage(resultMessage, event.threadID);
    api.unsendMessage(messageID);
  },
};