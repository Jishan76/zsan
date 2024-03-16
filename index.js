const express = require('express');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const app = express();
const PORT = 3000;

app.get('/video', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).send('Missing query parameter');
  }

  try {
    // Search for videos using yt-search
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).send('No videos found');
    }

    // Get the first video
    const firstVideo = videos[0];

    // Get video details
    const videoInfo = await ytdl.getInfo(firstVideo.url);

    // Get the highest quality video format
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
    if (!videoFormat) {
      return res.status(404).send('No video found');
    }

    const videoUrl = videoFormat.url;

    // Redirect the user to the direct video URL
    res.redirect(videoUrl);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/audio', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).send('Missing query parameter');
  }

  try {
    // Search for videos using yt-search
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).send('No videos found');
    }

    // Get the first video
    const firstVideo = videos[0];

    // Get video details
    const videoInfo = await ytdl.getInfo(firstVideo.url);

    // Get the highest quality audio format
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    if (!audioFormat) {
      return res.status(404).send('No audio found');
    }

    const audioUrl = audioFormat.url;

    // Redirect the user to the direct audio URL
    res.redirect(audioUrl);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
