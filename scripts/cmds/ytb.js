const axios = require('axios');
const { createWriteStream, createReadStream, unlinkSync, existsSync, mkdirSync, statSync } = require('fs-extra');
const { spawn } = require('child_process');
const moment = require('moment-timezone');
const ytdl = require('@distube/ytdl-core');

const mediaSavePath = __dirname + '/cache/Youtube/';
const key = "AIzaSyAygWrPYHFVzL0zblaZPkRcgIFZkBNAW9g"; // Replace with your API key

module.exports.config = {
    name: 'video',
    version: '1.0.0',
    author: 'Mr-Perfect',
    description: 'Play music or video through YouTube link or search keyword',
    category: 'Utility',
    usages: 'ytb <keyword/url>',
    countDown: 5
};


const downloadMedia = async (videoID, type, senderID) => {
    const filePath = `${mediaSavePath}${Date.now()}${senderID}.${type === 'video' ? 'mp4' : 'm4a'}`;
    const errObj = { filePath, error: 1 };

    try {
        const mediaObj = { filePath, error: 0 };
        if (!existsSync(mediaSavePath)) mkdirSync(mediaSavePath, { recursive: true });

        const ytdlOptions = type === 'video' ? { quality: '18' } : { filter: 'audioonly' };
        const stream = ytdl('https://www.youtube.com/watch?v=' + videoID, ytdlOptions);

        if (type === 'video') {
            await new Promise((resolve, reject) => {
                stream.pipe(createWriteStream(filePath))
                    .on('error', reject)
                    .on('close', resolve);
            });
        } else {
            await new Promise((resolve, reject) => {
                const ffmpegProcess = spawn('ffmpeg', [
                    '-i', 'pipe:0',
                    '-acodec', 'aac',
                    '-f', 'mp4',
                    filePath
                ]);

                stream.pipe(ffmpegProcess.stdin);

                ffmpegProcess.on('error', reject);
                ffmpegProcess.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`FFmpeg process exited with code ${code}`));
                });
            });
        }

        return mediaObj;
    } catch (e) {
        console.log(e);
        return errObj;
    }
};

// Handling user reply actions
module.exports.onReply = async function ({ api, event, Reply, commandName }) {
    const { threadID, messageID, body, senderID } = event;
    const { author, videoID, IDs, type: reply_type } = Reply;

    if (author != senderID) return;

    switch (reply_type) {
        case 'download': {
            const { filePath, error } = await downloadMedia(videoID, body === '1' ? 'video' : 'audio', senderID);
            if (error) {
                api.sendMessage('❎ An error occurred', threadID, messageID);
                if (existsSync(filePath)) unlinkSync(filePath);
            } else {
                api.unsendMessage(Reply.messageID);
                if (statSync(filePath).size > (body === '1' ? 50331648 : 26214400)) {
                    api.sendMessage('⚠️ File size is too large', threadID, messageID);
                    unlinkSync(filePath);
                } else {
                    api.sendMessage({
                        body: `[ YOUTUBE DOWNLOAD ]\n🔹 Your file is ready!`,
                        attachment: createReadStream(filePath)
                    }, threadID, (err) => {
                        if (err) api.sendMessage('❎ An error occurred', threadID, messageID);
                        if (existsSync(filePath)) unlinkSync(filePath);
                    }, messageID);
                }
            }
            break;
        }
        case 'list': {
            if (isNaN(body) || body < 1 || body > IDs.length) {
                api.sendMessage('⚠️ Choose a number from 1 to ' + IDs.length, threadID, messageID);
            } else {
                api.unsendMessage(Reply.messageID);
                const chosenID = IDs[parseInt(body) - 1];
                api.sendMessage('[ YOUTUBE SELECT ]\n1. Download video\n2. Download audio\n\n📌 Reply with the number', threadID, (err, info) => {
                    if (!err) {
                        global.GoatBot.onReply.set(info.messageID, {
                            commandName,
                            messageID: info.messageID,
                            author: senderID,
                            videoID: chosenID,
                            type: 'download'
                        });
                    }
                }, messageID);
            }
            break;
        }
    }
};

// Handling user commands
module.exports.onStart = async function ({ api, event, args, commandName }) {
    const { threadID, messageID, senderID } = event;
    if (args.length === 0) return api.sendMessage('❎ Please provide a search query', threadID, messageID);

    const input = args.join(' ');
    const isValidUrl = /^(http(s)?:\/\/)?(www\.)?youtu(be|\.be)?(\.com)?\/.+/gm.test(input);

    const getBasicInfo = async (keyword) => {
        try {
            const mediaData = (await axios.get(encodeURI(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${keyword}&type=video&key=${key}`))).data.items;
            return mediaData;
        } catch (e) {
            throw e;
        }
    }

    try {
        if (isValidUrl) {
            let videoID = input.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2] || input.split(/[^0-9a-z_\-]/i)[0];
            api.sendMessage('[ YOUTUBE SELECT ]\n1. Download video\n2. Download audio\n\n📌 Reply with the number', threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: senderID,
                        videoID,
                        type: 'download'
                    });
                }
            }, messageID);
        } else {
            const result = await getBasicInfo(input);
            let IDs = [], msg = `[ YOUTUBE SEARCH ]\n🔎 Results for: ${input}`;
            for (let i = 0; i < result.length; i++) {
                const id = result[i].id.videoId;
                if (id) {
                    IDs.push(id);
                    msg += `\n\n${i + 1}. ${result[i].snippet.title}`;
                }
            }
            msg += `\n\n📌 Reply with the number of the video you want to download`;
            api.sendMessage(msg, threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: senderID,
                        IDs,
                        type: 'list'
                    });
                }
            }, messageID);
        }
    } catch (e) {
        api.sendMessage('❎ Error:\n' + e, threadID, messageID);
    }
};