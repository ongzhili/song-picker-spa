# Access
https://ongzhili.github.io/song-picker-spa/

# How to run locally:

Setup server: `python -m http.server <port_number>`

Then, simply access `localhost:<port_number`


# Top Limit?

Sets the application to return your top X songs, where X is song limit. Defaults to infinity (full sorted list of songs)

# songList.json

```json
{
  "songName": "<song_name>",
  "songArtist": "<artist>",
  "video": "<video_file_name> or <youtube link>",
  "audio": "<mp3_file_name>",
  "songType": 0/1/2 (OP/ED/INS)
}

```

1. `songName`: song name
2. `songArtist`: artist
3. `video`: video file name (for amq file links) / youtube hyperlink (youtube)
4. `audio`: mp3 file name (for amq file links)
5. `songType`: Type of song (0 = OP, 1 = ED, 2 = INS) (amq thing)

