const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'FFmpeg API running ✅' });
});

app.post('/render', (req, res) => {
  const { imageUrl, audioUrl, hookText } = req.body;
  try {
    execSync(`wget -q "${imageUrl}" -O /tmp/bg.jpg`);
    execSync(`wget -q "${audioUrl}" -O /tmp/audio.mp3`);

    ffmpeg()
      .input('/tmp/bg.jpg')
      .inputOptions(['-loop 1'])
      .input('/tmp/audio.mp3')
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest'
      ])
      .output('/tmp/reel.mp4')
      .on('end', () => {
        res.json({ success: true, message: 'Video rendered ✅' });
      })
      .on('error', (err) => {
        res.status(500).json({ success: false, error: err.message });
      })
      .run();

  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('FFmpeg API running ✅');
});
// Add this at the bottom of server.js
setInterval(() => {
  const https = require('https');
  https.get('https://YOUR-RENDER-URL.onrender.com/', (res) => {
    console.log('Keep alive ping:', res.statusCode);
  }).on('error', () => {});
}, 840000); // 14 minutes
