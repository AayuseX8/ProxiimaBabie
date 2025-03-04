const DIG = require("discord-image-generation");
const fs = require("fs-extra");


module.exports = {
    config: {
        name: "kiss",
        aliases: ["kiss"],
        version: "1.0",
        author: "AceGun",
        countDown: 5,
        role: 0,
        shortDescription: "fun with lover or crush",
        longDescription: "",
        category: "fun",
        guide: ""
    },



    onStart: async function ({ api, message, event, args, usersData }) {
      let two, one;
        const mention = Object.keys(event.mentions);
      if(mention.length == 0) return message.reply("tag someon (@username)");
else if(mention.length == 1){
 two = event.senderID
   one = mention[0];
                
} else{
 two = mention[1]
   one = mention[0];
            
}


      	const avatarURL1 = await usersData.getAvatarUrl(two);
		const avatarURL2 = await usersData.getAvatarUrl(one);
		const img = await new DIG.Kiss().getImage(avatarURL1, avatarURL2);
		const pathSave = `${__dirname}/tmp/${two}_${one}kiss.png`;
		fs.writeFileSync(pathSave, Buffer.from(img));
		const content = "😘😘"
		message.reply({
			body: `${(content || "Bópppp 😵‍💫😵")}`,
			attachment: fs.createReadStream(pathSave)
		}, () => fs.unlinkSync(pathSave));
	}
};
