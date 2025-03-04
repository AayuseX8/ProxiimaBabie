const webshot = require('webshot-node');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "ss",
    version: "1.3",
    author: "Modified by You",
    countDown: 5,
    role: 0,
    description: "Take a screenshot of a website.",
    category: "tools",
    guide: { en: "{pn} <website URL> - Takes a screenshot of the given website." }
  },

  onStart: async function ({ message, args }) {
    if (!args[0] || !/^https?:\/\//.test(args[0])) {
      return message.reply("Namaskar kripya link halda yo kura dhyan dinu hos `http://` or `https://`.");
    }

    const url = args[0];
    const filePath = path.join(__dirname, "./cache/screenshot.png");

    message.reply("Abey bhai ho ki baini Yekxin parkhi screenshot liyera aaunxu");

    webshot(url, filePath, { screenSize: { width: 1280, height: 720 } }, function(err) {
      if (err) {
        console.error(err);
        return message.reply("Xya yarr screenshot lina gako mildai milena creator snga kura garnus huss");
      }

      message.reply({
        body: "✅ | Screenshot hera liga babu 😝",
        attachment: fs.createReadStream(filePath)
      });
    });
  }
};