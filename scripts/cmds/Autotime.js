const moment = require('moment-timezone');
const axios = require('axios');

module.exports.config = {
  name: "autotime",
  version: "3.0.0",
  role: 0,
  author: "Vincent armenion",//lol dude don't change the author if you change it i will hack your Facebook account👿
  description: "Automatically sends messages based on set times.",
  category: "AutoTime",
  countDown: 3
};

module.exports.onLoad = async ({ api, getLang , utils }) => {
  const arrayData = {
      "01:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 01:00 𝐀𝐌\n\n📌 It may be 1 am, but remember that this late hour is often when creativity and inspiration strike. Keep pushing forward and working on your goals, even when others are asleep. This quiet time is perfect for deep focus and productivity. Imagine the satisfaction of making progress while the world sleeps. You are dedicated, determined, and unstoppable. Your hard work will pay off, and success awaits those who are willing to put in the extra effort, even at 1 am.\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/0Wo5hqG.jpeg")
      },
      "02:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 02:00 𝐀𝐌\n\n📌 don't forget to drunk your coffee and exercise your body ☕💪\𝗇\𝗇VINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
       attachment: await global.utils.getStreamFromURL("https://i.imgur.com/JtLCEM9.jpeg")
      },
      "03:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 03:00 𝐀𝐌\n\n📌 aga nyo nagising ahh\n\nVINCENT\n\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/cVy7sNv.jpeg")
      },
      "04:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 04:00 𝐀𝐌\n\n📌  There is a certain magic in the stillness of 4am, as if the world is holding its breath in anticipation of a new day.🤙\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
     attachment: await global.utils.getStreamFromURL("https://i.imgur.com/czB4JLw.jpeg")
      },
      "05:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 05:00 𝐀𝐌\n\n📌 Every morning is a chance at a new beginning.\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/lukNOoJ.jpeg")
      },
      "06:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 06:00 𝐀𝐌\n\n📌 kape muna kayo☕\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/dRe1lix.jpeg")
      },
      "07:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 07:00 𝐀𝐌\n\n📌 don't forget to eat y'all breakfast!! 🍞☕🍛\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/O8UeAiB.jpeg")
      },
      "08:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 08:00 𝐀𝐌\n\n📌 Don't forget, y'all, to take your homework, clean your house, etc.\n\n—VINCENT\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/wtdSM2j.jpeg")
      },
      "09:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 09:00 𝐀𝐌\n\n📌 It's time to eat, guys! Don't forget to eat your breakfast or snacks, y'all. 😉\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/oxiG4Jr.jpeg")
      },
      "10:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 10:00 𝐀𝐌\n\n📌 how are you guys? \n\nVINCENT BOT\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/N5UVcId.jpeg")
      },
      "11:00:00 AM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 11:00 𝐀𝐌\n\n📌  At 11 AM, let go of yesterday and focus on making today the best it can be.\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/JX9qmuu.jpeg")
      },
      "12:00:00 PM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 12:00 𝐏𝐌\n\n📌  As the clock strikes noon, take a deep breath and remember that every new hour brings with it a chance for a fresh start, don't forget to eat y'all lunch break🍖🍛\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/oSIOPST.jpeg")
      },
      "01:00:00 PM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 01:00 𝐏𝐌\n\n📌 At 1pm, remember that every moment is a chance to start anew.\n\nVINCENT 𝖡𝖮𝖳\n▬▬▬▬▬▬▬▬▬▬▬▬", 
        attachment: await global.utils.getStreamFromURL("https://i.imgur.com/dTuWQge.jpeg")
      },
      "02:00:00 PM": {
        message: "🔔 𝗔𝘂𝘁𝗼 𝗧𝗶𝗺𝗲:\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n⏰ time now - 02:00 𝐏𝐌\n\n📌 go
