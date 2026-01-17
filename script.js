let songs = [];
let sortedSongs = [];
let comparisons = 0;
let topLimit = Infinity;
let region = 'nae'; // default
const mediaCache = {}; // key = song id or name, value = HTML element
const regionSelect = document.getElementById('region-select');


regionSelect.addEventListener('change', () => {
  region = regionSelect.value;      // update region
  Object.keys(mediaCache).forEach(key => delete mediaCache[key]); // clear cache
  console.log('Region changed to', region, '- cache cleared');
});


fetch('config.json')
  .then(res => res.json())
  .then(config => {
    if (config.topLimit !== undefined && !isNaN(config.topLimit)) {
      topLimit = config.topLimit;
    }
    console.log('Top limit from config:', topLimit);
  })
  .catch(err => {
    console.warn('Could not load config.json, using default topLimit = Infinity');
  });

// Fetch songs from JSON
fetch('songList.json')
  .then(res => res.json())
  .then(data => {
    songs = data.flat();
    console.log('Flattened song list:', songs);
    startInteractiveMergeSort(songs);
  })

const choicesDiv = document.getElementById('choices');
const sortedList = document.getElementById('sorted-list');

function getMediaElement(music) {
  if (mediaCache[music.name]) {
    return mediaCache[music.name].outerHTML; // return cached element
  }

  let videoElement;

  if (!music.video && !music.audio) {
    videoElement = '<div>Video and MP3 not available</div>';
  } else if (music.video) {
    if (music.video.includes('youtube.com')) {
      const videoId = new URL(music.video).searchParams.get('v');
      videoElement = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (music.video.endsWith('.webm') || music.video.endsWith('.mp4')) {
      videoFileName = music.video.split('/').pop();
      console.log(videoFileName);
      videoElement = `<video controls><source src="https://${region}dist.animemusicquiz.com/${videoFileName}" type="video/webm"></video>`;
    } else {
      videoElement = '<div>Video not available</div>';
    }
  } else if (music.mp3) {
    videoElement = `<audio controls><source src="${music.mp3}" type="audio/mp3"></audio>`;
  } else {
    videoElement = '<div>MP3 not available!</div>';
  }

  return videoElement;
}


// Recursive interactive merge sort
function startInteractiveMergeSort(array) {
  comparisons = 0;
  interactiveMergeSort(array, sorted => {
    // Once sorting is done
    sortedSongs = sorted;
    displaySortedSongs();
  });
}

function interactiveMergeSort(arr, callback) {
  if (arr.length <= 1) {
    callback(arr);
    return;
  }

  const mid = Math.floor(arr.length / 2);
  interactiveMergeSort(arr.slice(0, mid), left => {
    interactiveMergeSort(arr.slice(mid), right => {
      mergeUser(left, right, merged => {
        callback(merged);
      }, topLimit);
    });
  });
}

// Merge with user input
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

      const mediaDiv = document.createElement('div');
      mediaDiv.className = 'media-container';
      mediaDiv.innerHTML = getMediaElement(song); // reuse your cached media

      const btn = document.createElement('button');
      btn.className = 'choose-btn';
      btn.textContent = 'Choose';
      btn.onclick = () => {
        if (index === 0) merged.push(left.shift());
        else merged.push(right.shift());
        comparisons++;
        nextComparison();
      };

      optionDiv.appendChild(nameDiv);
      optionDiv.appendChild(mediaDiv);
      optionDiv.appendChild(btn);

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
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${song.songName} by ${song.songArtist}`;
    sortedList.appendChild(li);
  });

  document.getElementById('sorted-header').style.display = 'block';
  sortedList.style.display = 'block';


  const comparisonDiv = document.createElement('div');
  comparisonDiv.id = 'comparison-div';
  comparisonDiv.textContent = `Total Comparisons: ${comparisons}`;
  sortedList.parentElement.appendChild(comparisonDiv);
}
