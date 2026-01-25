let songs = [];
let sortedSongs = [];
let comparisons = 0;
let topLimit = Infinity;
let region = 'nae'; // default
const mediaCache = {}; // key = song id or name, value = HTML element
const regionSelect = document.getElementById('region-select');

const MEDIA = {
  VIDEO: 'video',
  AUDIO: 'audio',
};

const startBtn = document.getElementById('start-btn');
const songListInput = document.getElementById('songlist-input');
const topLimitInput = document.getElementById('toplimit-input');
const setupDiv = document.getElementById('setup');


regionSelect.addEventListener('change', () => {
  region = regionSelect.value;      // update region
  Object.keys(mediaCache).forEach(key => delete mediaCache[key]); // clear cache
  console.log('Region changed to', region, '- cache cleared');
});

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

startBtn.addEventListener('click', () => {
  const file = songListInput.files[0];
  if (!file) {
    alert('Please upload a song list JSON file');
    return;
  }

  const parsedLimit = Number(topLimitInput.value);
  topLimit = !isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : Infinity;

  setupDiv.style.display = 'none';

  loadSongsFromFile(file);
});

function loadSongsFromFile(file) {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      songs = data.flat();

      console.log('Loaded songs from file:', songs);

      shuffleArray(songs);
      startInteractiveMergeSort(songs);
    } catch (err) {
      alert('Invalid JSON file');
      console.error(err);
    }
  };

  reader.readAsText(file);
}

const choicesDiv = document.getElementById('choices');
const sortedList = document.getElementById('sorted-list');

function getMediaElement(music, mediaType) {
  const SEPARATOR = '|';
  if (mediaCache[music.name + SEPARATOR + mediaType]) {
    return mediaCache[music.name + SEPARATOR + mediaType].outerHTML;
  }

  let videoElement;

  if (mediaType === MEDIA.VIDEO) {
    videoElement = getVideoElement(music);
  } else if (mediaType === MEDIA.AUDIO) {
    videoElement = getAudioElement(music);
  } else {
    videoElement = '<div>Media type not supported</div>';
  }

  return videoElement;
}

function getVideoElement(music) {
  let mediaSrc = null;

  // 🔹 Priority: HQ → MQ → video
  if (music.HQ) {
    mediaSrc = music.HQ;
  } else if (music.MQ) {
    mediaSrc = music.MQ;
  } else if (music.video) {
    mediaSrc = music.video;
  }

  if (!mediaSrc) {
    return '<div>Video not available</div>';
  }

  if (mediaSrc.includes('youtube.com')) {
    const videoId = new URL(mediaSrc).searchParams.get('v');
    return `
      <iframe 
        src="https://www.youtube-nocookie.com/embed/${videoId}" 
        frameborder="0" 
        allowfullscreen>
      </iframe>`;
  }

  if (mediaSrc.endsWith('.webm') || mediaSrc.endsWith('.mp4')) {
    const videoFileName = mediaSrc.split('/').pop();
    return `
      <video controls>
        <source src="https://${region}dist.animemusicquiz.com/${videoFileName}" type="video/webm">
      </video>`;
  }

  return '<div>Video not available</div>';

}

function getAudioElement(music) {
  const audioSrc = music.mp3 || music.audio;

  if (!audioSrc) {
    return '<div>MP3 not available!</div>';
  }

  return `
    <audio controls>
      <source src="${audioSrc}" type="audio/mp3">
    </audio>`;
}


function startInteractiveMergeSort(array) {
  comparisons = 0;
  breadthFirstMergeSort(array, sorted => {
    sortedSongs = sorted;
    displaySortedSongs();
  }, topLimit);
}

function breadthFirstMergeSort(arr, callback, limit = Infinity) {
  let queue = arr.map(item => [item]); // treat each song as a mini-array

  function nextLevel() {
    if (queue.length === 1) {
      callback(queue[0].slice(0, limit));
      return;
    }

    const nextQueue = [];
    let i = 0;

    function mergePair() {
      if (i >= queue.length) {
        queue = nextQueue;
        nextLevel();
        return;
      }

      const left = queue[i];
      const right = queue[i + 1] || [];

      mergeUser(left, right, merged => {
        nextQueue.push(merged);
        i += 2;
        mergePair();
      }, limit);
    }

    mergePair();
  }

  nextLevel();
}

function createSongInfoElements(song) {
  const infoContainer = document.createElement('div');
  infoContainer.className = 'song-info';

  // Song name
  const nameP = document.createElement('p');
  nameP.className = 'song-name-text';
  nameP.textContent = song.songName;
  infoContainer.appendChild(nameP);

  // Artist name
  const artistP = document.createElement('p');
  artistP.className = 'song-artist-text';
  artistP.textContent = song.songArtist;
  infoContainer.appendChild(artistP);

  // Anime name (if exists)
  if (song.animeName) {
    const animeP = document.createElement('p');
    animeP.className = 'song-anime-text';
    animeP.textContent = song.animeName;
    infoContainer.appendChild(animeP);
  }

  return infoContainer;
}

function destroyMediaContainer(containerDiv) {
  if (!containerDiv) return;

  // Find audio or video inside the container
  const mediaEl = containerDiv.querySelector('audio, video, iframe');

  if (mediaEl) {
    try {
      // 1. Stop playback immediately
      mediaEl.pause();

      // 2. Firefox-safe teardown
      mediaEl.removeAttribute('src');
      mediaEl.load();
    } catch (e) {
      // Defensive: media might already be detached
      console.log('Media cleanup failed:', e);
    }
  }

  // 3. Remove the container from the DOM (Chrome + Firefox)
  if (containerDiv.parentNode) {
    containerDiv.parentNode.removeChild(containerDiv);
  }
}

function mergeUser(left, right, callback, limit = 10) {
  const merged = [];

  function nextComparison() {

    // Stop early if we've already obtained the top `limit`
    if (merged.length >= limit) {
      callback(merged);
      return;
    }


    if (left.length === 0) {
      merged.push(...right.slice(0, limit - merged.length)); // only take enough to reach limit
      callback(merged);
      return;
    }

    if (right.length === 0) {
      merged.push(...left.slice(0, limit - merged.length));  // only take enough to reach limit
      callback(merged);
      return;
    }

    // Show 2 options to user
    choicesDiv.innerHTML = '';

    [left[0], right[0]].forEach((song, index) => {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'song-option';

      const songInfo = createSongInfoElements(song);
      optionDiv.appendChild(songInfo);

      let mediaDiv = null; // Don't create yet
      let currentMediaType = null; // Track which media is currently shown

      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'media-buttons';

      const showVideoBtn = document.createElement('button');
      showVideoBtn.className = 'show-media-btn';
      showVideoBtn.textContent = 'Show Video';

      const showAudioBtn = document.createElement('button');
      showAudioBtn.className = 'show-media-btn';
      showAudioBtn.textContent = 'Show Audio';

      showVideoBtn.onclick = () => {
        if (!mediaDiv) {
          mediaDiv = document.createElement('div');
          mediaDiv.className = 'media-container';
          mediaDiv.innerHTML = getMediaElement(song, MEDIA.VIDEO);
          optionDiv.insertBefore(mediaDiv, buttonsDiv);
          currentMediaType = MEDIA.VIDEO;
          showVideoBtn.textContent = 'Hide Video';
          showAudioBtn.textContent = 'Show Audio';
        } else if (currentMediaType === MEDIA.VIDEO) {
          destroyMediaContainer(mediaDiv);
          mediaDiv = null;
          currentMediaType = null;
          showVideoBtn.textContent = 'Show Video';
        } else {
          destroyMediaContainer(mediaDiv);
          mediaDiv = document.createElement('div');
          mediaDiv.className = 'media-container';
          mediaDiv.innerHTML = getMediaElement(song, MEDIA.VIDEO);
          optionDiv.insertBefore(mediaDiv, buttonsDiv);
          currentMediaType = MEDIA.VIDEO;
          showVideoBtn.textContent = 'Hide Video';
          showAudioBtn.textContent = 'Show Audio';
        }
      };

      showAudioBtn.onclick = () => {
        if (!mediaDiv) {
          mediaDiv = document.createElement('div');
          mediaDiv.className = 'media-container';
          mediaDiv.innerHTML = getMediaElement(song, MEDIA.AUDIO);
          optionDiv.insertBefore(mediaDiv, buttonsDiv);
          currentMediaType = MEDIA.AUDIO;
          showAudioBtn.textContent = 'Hide Audio';
          showVideoBtn.textContent = 'Show Video';
        } else if (currentMediaType === MEDIA.AUDIO) {
          destroyMediaContainer(mediaDiv);
          mediaDiv = null;
          currentMediaType = null;
          showAudioBtn.textContent = 'Show Audio';
        } else {
          destroyMediaContainer(mediaDiv);
          mediaDiv = document.createElement('div');
          mediaDiv.className = 'media-container';
          mediaDiv.innerHTML = getMediaElement(song, MEDIA.AUDIO);
          optionDiv.insertBefore(mediaDiv, buttonsDiv);
          currentMediaType = MEDIA.AUDIO;
          showAudioBtn.textContent = 'Hide Audio';
          showVideoBtn.textContent = 'Show Video';
        }
      };

      const chooseBtn = document.createElement('button');
      chooseBtn.className = 'choose-btn';
      chooseBtn.textContent = 'Choose';
      chooseBtn.onclick = () => {
        if (index === 0) merged.push(left.shift());
        else merged.push(right.shift());
        comparisons++;
        nextComparison();
      };

      const skipBtn = document.createElement('button');
      skipBtn.className = 'skip-btn';
      skipBtn.textContent = 'Skip (Removes permanently!!)';
      skipBtn.onclick = () => {
        if (index === 0) left.shift();
        else right.shift();
        nextComparison();
      };

      const actionButtonsDiv = document.createElement('div');
      actionButtonsDiv.className = 'action-buttons';

      buttonsDiv.appendChild(showVideoBtn);
      buttonsDiv.appendChild(showAudioBtn);
      optionDiv.appendChild(buttonsDiv);
      actionButtonsDiv.appendChild(chooseBtn);
      actionButtonsDiv.appendChild(skipBtn);
      optionDiv.appendChild(actionButtonsDiv);
      choicesDiv.appendChild(optionDiv);
    });
  }

  nextComparison();
}

// Display sorted songs and comparison count
function displaySortedSongs() {
  choicesDiv.innerHTML = '';
  sortedList.innerHTML = '';

  sortedSongs.forEach((song, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="rank">${index + 1}</td>
      <td class="song-title">${song.songName}</td>
      <td class="song-artist">${song.songArtist}</td>
      <td class="song-anime">${song.animeName || 'None'}</td>
    `;

    sortedList.appendChild(tr);
  });

  document.getElementById('sorted-wrapper').style.display = 'block';

  const comparisonDiv = document.createElement('div');
  comparisonDiv.id = 'comparison-div';
  comparisonDiv.textContent = `Total Comparisons: ${comparisons}`;
  document.getElementById('sorted-wrapper').appendChild(comparisonDiv);

}
