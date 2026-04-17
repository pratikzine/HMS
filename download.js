const https = require('https');
const fs = require('fs');

const url = 'https://assets.mixkit.co/videos/preview/mixkit-medical-consultation-in-a-hospital-room-41712-large.mp4';
const dest = 'e:\\HMS\\frontend\\public\\bg-video.mp4';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://mixkit.co/'
  }
};

const file = fs.createWriteStream(dest);

https.get(url, options, (response) => {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete');
    });
  } else {
    console.error(`Failed with status: ${response.statusCode}`);
  }
}).on('error', (err) => {
  fs.unlink(dest, () => {});
  console.error(`Error: ${err.message}`);
});
