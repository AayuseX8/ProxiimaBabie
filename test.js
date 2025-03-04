const axios = require('axios');

const apiKey = 'r-027fb3016544de39da06654e'; // Replace with your valid API key
const prompt = 'A girl on a roof';
const quality = 'Standard v3.1'; // or 'Heavy v3.1' based on your needs
const aspectRatio = 'square'; // or 'portrait'
const dimensions = aspectRatio === 'portrait' ? { width: 640, height: 1024 } : { width: 1024, height: 1024 };

const apiUrl = `https://for-devs.ddns.net/api/niji`;

axios.get(apiUrl, {
  params: {
    prompt: prompt,
    style: 'Cinematic',
    sampler: 'DDIM',
    quality: quality,
    width: dimensions.width,
    height: dimensions.height,
    ratio: `${dimensions.width}x${dimensions.height}`,
    apikey: apiKey
  },
  responseType: 'arraybuffer'
})
.then(response => {
  if (response.status === 200) {
    const imageBuffer = Buffer.from(response.data, 'binary');
    // Handle the image buffer (e.g., save to file, send in a response)
  } else {
    console.error(`Failed to generate image. Server responded with status ${response.status}.`);
  }
})
.catch(error => {
  console.error(`Error: ${error.message}`);
});