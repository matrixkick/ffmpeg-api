const express = require('express');
const { execSync } = require('child_process');
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
    execSync(`ffmpeg -y -loop 1 -i /tmp/bg.jpg \
      -i /tmp/audio.mp3 \
      -vf "drawtext=text='${hookText}':fontsize=48:\
      fontcolor=white:x=(w-text_w)/2:y=150:\
      shadowcolor=black:shadowx=2:shadowy=2" \
      -c:v libx264 -c:a aac -b:a 192k \
      -pix_fmt yuv420p -shortest /tmp/reel.mp4`);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('FFmpeg API running');
});
