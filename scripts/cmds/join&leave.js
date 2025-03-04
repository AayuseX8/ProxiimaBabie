const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

module.exports = {
  config: {
    name: "group",
    version: "3.6",
    author: "Mr-Perfect",
    countDown: 5,
    role: 0,
    shortDescription: "Manage group join/leave requests",
    longDescription: "Lists the groups and allows users to join or leave them via replies.",
    category: "owner",
    guide: {
      en: "{p}{n} or {p}{n}s",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      // Fetch the list of groups
      const groupList = await api.getThreadList(10, null, ["INBOX"]);
      const botID = api.getCurrentUserID();

      // Filter groups where the bot is still a member
      const activeGroups = await Promise.all(
        groupList.map(async (group) => {
          try {
            const threadInfo = await api.getThreadInfo(group.threadID);
            return threadInfo.participantIDs.includes(botID) ? group : null;
          } catch {
            return null; // Ignore groups that cause errors (e.g., bot already left)
          }
        })
      );

      // Remove null entries
      const filteredGroups = activeGroups.filter(group => group !== null);

      if (filteredGroups.length === 0) {
        api.sendMessage("No active group chats found where the bot is a member.", event.threadID);
      } else {
        const formattedList = filteredGroups.map((group, index) => {
          const groupName = group.threadName || "(Unnamed Group)";
          return `│${index + 1}. ${groupName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`;
        });

        const message = `╭─╮\n│𝐋𝐢𝐬𝐭 𝐨𝐟 𝐀𝐜𝐭𝐢𝐯𝐞 𝐆𝐫𝐨𝐮𝐩𝐬:\n${formattedList.join("\n")}\n╰───────────ꔪ\n\nReply with:\n- **join [group numbers/all]** to join.\n- **leave [group numbers/all]** to leave.`;

        const sentMessage = await api.sendMessage(message, event.threadID);
        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: "group",
          messageID: sentMessage.messageID,
          author: event.senderID,
          groupList: filteredGroups, // Save the filtered list for reuse
        });
      }
    } catch (error) {
      console.error("Error listing active group chats", error);
      api.sendMessage("⚠️ An error occurred while fetching the group list. Please try again later.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { author, groupList } = Reply;

    if (event.senderID !== author) {
      return;
    }

    const args = event.body.split(" ");
    const command = args[0].toLowerCase();
    const groupNumbers = args.slice(1).map(num => parseInt(num, 10));

    try {
      if (command === "join") {
        const groupsToJoin = args[1] === "all"
          ? groupList
          : groupNumbers.map(num => groupList[num - 1]).filter(group => group);

        for (const group of groupsToJoin) {
          const memberList = await api.getThreadInfo(group.threadID);

          if (memberList.participantIDs.includes(event.senderID)) {
            api.sendMessage(
              {
                body: `Hey @${event.senderID}, you are already in the group **${group.threadName || "Unnamed Group"}**!`,
                mentions: [{ tag: `@${event.senderID}`, id: event.senderID }],
              },
              event.threadID
            );
          } else if (memberList.approvalMode) {
            // Notify admins in the group about the join request
            const adminMentions = memberList.adminIDs.map(admin => ({
              tag: `@${admin.id}`,
              id: admin.id,
            }));

            // Request approval by sending the message in the group
            api.sendMessage(
              {
                body: `🔔 Approval request from the Admins for user @${event.senderID}. Please approve the request!`,
                mentions: [
                  { tag: `@${event.senderID}`, id: event.senderID },
                  ...adminMentions, // Mention all admins
                ],
              },
              group.threadID
            );

            // Trigger the actual approval system by attempting to add the user
            api.addUserToGroup(event.senderID, group.threadID, (err) => {
              if (err) {
                console.error("Error adding user to group with approval:", err);
                api.sendMessage(
                  `⚠️ Failed to send the join request for **${group.threadName || "Unnamed Group"}**. Please try again.`,
                  event.threadID
                );
              } else {
                api.sendMessage(
                  `✅ An approval request has been sent to **${group.threadName || "Unnamed Group"}** successfully!`,
                  event.threadID
                );
              }
            });
          } else {
            api.addUserToGroup(event.senderID, group.threadID, () => {
              api.sendMessage(
                `🎉 Well, you have been added to the group **${group.threadName || "Unnamed Group"}**!`,
                event.threadID
              );
              api.sendMessage(
                `🌟 Welcome to the group!`,
                group.threadID
              );
            });
          }
        }
      } else if (command === "leave") {
        const groupsToLeave = args[1] === "all"
          ? groupList
          : groupNumbers.map(num => groupList[num - 1]).filter(group => group);

        for (const group of groupsToLeave) {
          api.sendMessage(
            "👋 Please contact the Admins, thanks! 👍\nMiss you guys, I'm leaving. ✌️",
            group.threadID,
            () => {
              api.removeUserFromGroup(api.getCurrentUserID(), group.threadID, () => {
                api.sendMessage(
                  `🛑 Well, I have left the group **${group.threadName || "Unnamed Group"}** (TID: ${group.threadID}).`,
                  event.threadID
                );
              });
            }
          );
        }
      } else {
        api.sendMessage(
          "❌ Invalid command! Please use **join [group numbers/all]** or **leave [group numbers/all]**.",
          event.threadID
        );
      }
    } catch (error) {
      console.error("Error processing the group request", error);
      api.sendMessage(
        "⚠️ An error occurred while processing your request. Please try again later.",
        event.threadID
      );
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  },
};