const itunes = require("searchitunes");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "appstore",
    version: "1.4",
    author: "Mr Perfect",
    countDown: 3,
    role: 0,
    description: {
      en: "Search apps on the App Store"
    },
    category: "software",
    guide: "{pn} <keyword>\n   Example: {pn} PUBG",
    envConfig: {
      limitResult: 3
    }
  },

  langs: {
    en: {
      missingKeyword: "You haven't entered any keyword.",
      noResult: "No result found for keyword %1.",
      selectApp: "Reply with the number of the app to view its details.",
      detailedInfo: "Name: %1\nCreator: %2\nRatings: %3\nPositive Ratings: %4\nNegative Ratings: %5\nTo download: %6",
      noMoreResults: "No more apps available."
    }
  },

  onStart: async function ({ message, args, commandName, envCommands, getLang }) {
    if (!args[0]) {
      return message.reply(getLang("missingKeyword"));
    }

    const keyword = args.join(" ");
    const limit = envCommands[commandName].limitResult;

    try {
      const results = await searchApp(keyword, limit);

      if (results.length > 0) {
        const appQueue = results.map((app, index) => ({
          index: index + 1,
          name: app.trackCensoredName,
          creator: app.artistName,
          ratings: app.averageUserRating || 0,
          positiveRatings: app.userRatingCountForCurrentVersion || 0,
          negativeRatings: Math.max(
            0,
            app.userRatingCount ? app.userRatingCount - app.userRatingCountForCurrentVersion : 0
          ),
          url: app.trackViewUrl,
          icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60
        }));

        let msg = appQueue
          .map(
            app =>
              `${app.index}. Name: ${app.name}\n   Creator: ${app.creator}\n   Ratings: ${app.ratings.toFixed(
                1
              )}/5\n   Positive Ratings: ${app.positiveRatings}\n   Negative Ratings: ${app.negativeRatings}`
          )
          .join("\n\n");

        global.appstoreQueue = appQueue;

        message.reply(
          `${msg}\n\n${getLang("selectApp")}`,
          (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              appQueue
            });
          }
        );
      } else {
        message.reply(getLang("noResult", keyword));
      }
    } catch (error) {
      message.reply(getLang("noResult", keyword));
    }
  },

  onReply: async function ({ message, event, Reply, getLang }) {
    const { appQueue } = Reply;
    const selectedNumber = parseInt(event.body);

    if (isNaN(selectedNumber) || selectedNumber < 1 || selectedNumber > appQueue.length) {
      return message.reply(getLang("selectApp"));
    }

    const selectedApp = appQueue.find(app => app.index === selectedNumber);
    if (selectedApp) {
      const detailedMessage = getLang(
        "detailedInfo",
        selectedApp.name,
        selectedApp.creator,
        `${selectedApp.ratings.toFixed(1)}/5`,
        selectedApp.positiveRatings,
        selectedApp.negativeRatings,
        selectedApp.url
      );

      return message.reply(
        {
          body: detailedMessage,
          attachment: selectedApp.icon
            ? [await getStreamFromURL(selectedApp.icon)]
            : []
        },
        (error, info) => {
          global.GoatBot.onReply.delete(info.messageID);
        }
      );
    } else {
      message.reply(getLang("noMoreResults"));
    }
  }
};

async function searchApp(keyword, limit) {
  const response = await itunes({
    entity: "software",
    country: "US",
    term: keyword,
    limit: limit
  });
  return response.results || [];
}