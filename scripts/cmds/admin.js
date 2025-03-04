const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    version: "1.7",
    author: "NTKhang (Modified by You)",
    countDown: 5,
    role: 2,
    description: "Add, remove, or list admin users.",
    category: "box chat",
    guide: {
      en: "   {pn} [add | -a] <uid | @tag>: Add admin role for user\n"
        + "   {pn} [remove | -r] <uid | @tag>: Remove admin role of user\n"
        + "   {pn} [list | -l]: List all admins"
    }
  },

  langs: {
    en: {
      added: "✅ | Added admin role for %1 users:\n%2",
      alreadyAdmin: "⚠️ | %1 users already have admin role:\n%2",
      missingIdAdd: "⚠️ | Please enter ID, tag user, or reply to a message to add an admin.",
      removed: "✅ | Removed admin role from %1 users:\n%2",
      notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
      missingIdRemove: "⚠️ | Please enter ID, tag user, or reply to a message to remove an admin.",
      listAdmin: "👑 | List of admins:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    switch (args[0]) {
      case "add":
      case "-a": {
        let uids = [];

        if (Object.keys(event.mentions).length > 0)
          uids = Object.keys(event.mentions);
        else if (event.messageReply) 
          uids.push(event.messageReply.senderID);
        else 
          uids = args.filter(arg => !isNaN(arg));

        if (uids.length === 0) 
          return message.reply(getLang("missingIdAdd"));

        const notAdminIds = [];
        const adminIds = [];

        for (const uid of uids) {
          if (config.adminBot.includes(uid))
            adminIds.push(uid);
          else
            notAdminIds.push(uid);
        }

        config.adminBot.push(...notAdminIds);
        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));

        return message.reply(
          (notAdminIds.length > 0 ? getLang("added", notAdminIds.length, getNames.join("\n")) : "")
          + (adminIds.length > 0 ? getLang("alreadyAdmin", adminIds.length, adminIds.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "remove":
      case "-r": {
        let uids = [];

        if (Object.keys(event.mentions).length > 0)
          uids = Object.keys(event.mentions);
        else if (event.messageReply)
          uids.push(event.messageReply.senderID);
        else
          uids = args.filter(arg => !isNaN(arg));

        if (uids.length === 0) 
          return message.reply(getLang("missingIdRemove"));

        const notAdminIds = [];
        const adminIds = [];

        for (const uid of uids) {
          if (config.adminBot.includes(uid))
            adminIds.push(uid);
          else
            notAdminIds.push(uid);
        }

        for (const uid of adminIds)
          config.adminBot.splice(config.adminBot.indexOf(uid), 1);

        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

        const getNames = await Promise.all(adminIds.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));

        return message.reply(
          (adminIds.length > 0 ? getLang("removed", adminIds.length, getNames.join("\n")) : "")
          + (notAdminIds.length > 0 ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
        );
      }

      case "list":
      case "-l": {
        const getNames = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => `• ${name} (${uid})`)));
        return message.reply(getLang("listAdmin", getNames.join("\n")));
      }

      default:
        return message.SyntaxError();
    }
  }
};