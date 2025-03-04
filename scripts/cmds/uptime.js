module.exports = {
  config: {
    name: "uptime",
aliases: ["upt"],
    version: "1.0",
    author: "OtinXSandip",
    role: 0,
    shortDescription: {
      en: "Displays the total number of users of the bot and check uptime "
    },
    longDescription: {
      en: "Displays the total number of users who have interacted with the bot and check uptime."
    },
    category: "system",
    guide: {
      en: "Use {p}totalusers to display the total number of users of the bot and check uptime."
    }
  },
  onStart: async function ({ api, event, args, usersData, threadsData }) {
    try {
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
   const days = 
Math.floor(uptime / (3600 * 24));
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const uptimeString = `${days}𝙹𝙾𝚄𝚁𝚂☩ ${hours}𝙷𝚁𝚂☩ ${minutes}𝙼𝙸𝙽☩ ${seconds}𝚂𝙴𝙲☩`;
      
      api.sendMessage(`✨| ✰.....𝗗𝗨𝗥𝗘𝗘....✰\n➫ ${uptimeString}\n\n👻 | 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗘𝗨𝗥𝗦🧑‍💻\n➫ ${allUsers.length}\n🕊| 𝗚𝗥𝗢𝗨𝗣𝗘+𝗣𝗩🙌\n➫ ${allThreads.length}`, event.threadID);
    } catch (error) {
      console.error(error);
      api.sendMessage("An error occurred while retrieving data.", event.threadID);
    }
  }
};
