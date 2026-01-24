let songs = [];
let sortedSongs = [];
let comparisons = 0;
let topLimit = Infinity;
let region = 'nae'; // default
const mediaCache = {}; // key = song id or name, value = HTML element
const regionSelect = document.getElementById('region-select');

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

function getMediaElement(music) {
  if (mediaCache[music.name]) {
    return mediaCache[music.name].outerHTML;
  }

  let mediaSrc = null;

  // 🔹 Priority: HQ → MQ → video
  if (music.HQ) {
    mediaSrc = music.HQ;
  } else if (music.MQ) {
    mediaSrc = music.MQ;
  } else if (music.video) {
    mediaSrc = music.video;
  }

  let videoElement;

  if (!mediaSrc && !music.audio && !music.mp3) {
    videoElement = '<div>Video and MP3 not available</div>';
  }
  else if (mediaSrc) {
    if (mediaSrc.includes('youtube.com')) {
      const videoId = new URL(mediaSrc).searchParams.get('v');
      videoElement = `
        <iframe 
          src="https://www.youtube-nocookie.com/embed/${videoId}" 
          frameborder="0" 
          allowfullscreen>
        </iframe>`;
    }
    else if (mediaSrc.endsWith('.webm') || mediaSrc.endsWith('.mp4')) {
      const videoFileName = mediaSrc.split('/').pop();
      videoElement = `
        <video controls>
          <source src="https://${region}dist.animemusicquiz.com/${videoFileName}" type="video/webm">
        </video>`;
    }
    else {
      videoElement = '<div>Video not available</div>';
    }
  }
  else if (music.mp3 || music.audio) {
    const audioSrc = music.mp3 || music.audio;
    videoElement = `
      <audio controls>
        <source src="${audioSrc}" type="audio/mp3">
      </audio>`;
  }
  else {
    videoElement = '<div>MP3 not available!</div>';
  }

  return videoElement;
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

      const nameDiv = document.createElement('div');
      nameDiv.className = 'song-name';
      nameDiv.textContent = `${song.songName} by ${song.songArtist}`;

      let mediaDiv = null; // Don't create yet

      const showMediaBtn = document.createElement('button');
      showMediaBtn.className = 'show-media-btn';
      showMediaBtn.textContent = 'Show Media';
      showMediaBtn.onclick = () => {
        if (!mediaDiv) {
          mediaDiv = document.createElement('div');
          mediaDiv.className = 'media-container';
          mediaDiv.innerHTML = getMediaElement(song);
          optionDiv.insertBefore(mediaDiv, chooseBtn);
          showMediaBtn.textContent = 'Hide Media';
        } else {
          optionDiv.removeChild(mediaDiv);
          mediaDiv = null;
          showMediaBtn.textContent = 'Show Media';
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

      optionDiv.appendChild(nameDiv);
      optionDiv.appendChild(showMediaBtn);
      optionDiv.appendChild(chooseBtn);

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
    `;

    sortedList.appendChild(tr);
  });

  document.getElementById('sorted-wrapper').style.display = 'block';

  const comparisonDiv = document.createElement('div');
  comparisonDiv.id = 'comparison-div';
  comparisonDiv.textContent = `Total Comparisons: ${comparisons}`;
  document.getElementById('sorted-wrapper').appendChild(comparisonDiv);

}
