# How to run locally:

Setup server: `python -m http.server <port_number>`

Then, simply access `localhost:<port_number`

# songList.json

```json
{
  "songName": "<song_name>",
  "songArtist": "<artist>",
  "video": "<video_file_name> or <youtube link>",
  "audio": "<mp3_file_name>",
}

```

1. songName: song name
2. songArtist: artist
3. video: video file name (for amq file links) / youtube hyperlink (youtube)
4. audio: mp3 file name (for amq file links)
