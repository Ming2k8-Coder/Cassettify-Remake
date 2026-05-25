let cassetteData = [];
let audioList = [];
let activeAudioIndex = -1;


async function updateAudioFiles() {
    cassetteData = await window.metadata.getCassetteData();
    const audioListContainer = document.getElementById("songlist-container");


    document.getElementById("audio-player-button").classList.remove('active');

    for (let i = 0; i < audioList.length; i++) {
        audioList[i].pause();
        audioList[i].currentTime = 0;
    };

    audioListContainer.textContent = '';

    for (let i = 0; i < cassetteData.length; i++) {
        let data = cassetteData[i];
        const audioContainer = document.createElement("div");
        audioContainer.id = "song-container-" + i;
        audioContainer.classList.add("song-container");

        const audio = new Audio(`../cassettes/${data.UUID}/originalAudio/${data.filename}`);
        audioList[i] = audio;

        audioContainer.innerHTML = `
            <figure>
                <div class="image-container" onclick="toggleAudio(${i});">
                    <img src="../cassetteAlbumCovers/${data.coverHash}.jpg" alt="${data.coverHash}"/>
                </div>
                <figcaption>
                    <li>
                        <ul>${data.artist}</ul>
                        <ul>${data.title}</ul>
                    </li>
                </figcaption>
                <div class="song-container-buttons">
                    <button></button>
                    <button></button>
                    <button></button>
                </div>
            </figure>
        `;
        audioListContainer.appendChild(audioContainer);

        audioContainer.classList.add('searched');
    };
    console.log(document.getElementById("song-search-input").value,)
    searchAudio(document.getElementById("song-search-input").value);
}



async function selectAudioFiles() {
    const audioPaths = await window.filesystem.openFileDialog();
    // creates an item in the cassettes folder for each file selected in the file dialog
    for (const path of audioPaths) {
        await window.metadata.initializeAudio(path);
    }
    await updateAudioFiles()
}


async function setAudioState(i) {
    const data = await cassetteData[i]
    const audio = audioList[i];
    const element = document.getElementById("song-container-" + i);
    const audioPlayerButton = document.getElementById("audio-player-button");
    const audioPlayerCover = document.getElementById("audio-player-cover");
    const audioPlayerTitle = document.getElementById("audio-player-title");

    audioPlayerCover.src = `../cassetteAlbumCovers/${(data.coverHash)}.jpg`;
    audioPlayerTitle.innerHTML = `${data.artist} - ${data.title}`;

    for (let j = 0; j < audioList.length; j++) {
        if (j != i && audio.paused) {
            audioList[j].pause();
            audioList[j].currentTime = 0;
            document.getElementById("song-container-" + j).classList.remove('active');
        };
    };

    if (element.classList.contains('active')) {
        audio.play();
    }
    else {
        audio.pause();
    };

    updateSongTime();

    audio.addEventListener('ended', () => {
        element.classList.remove('active');
        audioPlayerButton.classList.remove('active');
    });
}

function searchAudio(searchInput) {
    console.log(searchInput)
    for (let i = 0; i < audioList.length; i++) {
        const element = document.getElementById("song-container-" + i);
        console.log(element)
        const songDetailElements = element.querySelectorAll('figure figcaption li ul');
        for (let j = 0; j < songDetailElements.length; j++) {
            if ((songDetailElements[j].innerHTML.toLowerCase().includes(searchInput.toLowerCase())) || searchInput == '') {
                element.classList.add('searched');
                break;
            }
            else {
                element.classList.remove('searched')
            };
        };
    };
};

function toggleAudio(i, usedAudioPlayer=false) {
    activeAudioIndex = i;
    const songContainerElement = document.getElementById('song-container-' + i);
    const audioPlayerButton = document.getElementById('audio-player-button')
    if (usedAudioPlayer) {
        audioPlayerButton.classList.toggle('active');
        if (audioPlayerButton.classList.contains('active')) {
            songContainerElement.classList.add('active');
        }
        else {
            songContainerElement.classList.remove('active');
        };
    }
    else {
        songContainerElement.classList.toggle('active');
        if (songContainerElement.classList.contains('active')) {
            audioPlayerButton.classList.add('active');
        }
        else {
            audioPlayerButton.classList.remove('active');
        };
    };

    setAudioState(i);
};

setInterval(updateSongTime, 1000);

function updateSongTime() {
    const audio = audioList[activeAudioIndex];
    const audioTime = document.getElementById('audio-player-time');
    const audioProgressBar = document.getElementById('audio-player-progress-level')
    if (audio && !audio.paused) {
        audioTime.innerHTML = `${Math.floor(audio.currentTime / 60)}:${String(Math.floor(audio.currentTime % 60)).padStart(2, '0')} | ${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`;
        audioProgressBar.style.width = (audio.currentTime / audio.duration * 100) + "%";
        audioProgressBar.style.transition = "width 1s linear";
    }
}

updateAudioFiles();

const songSearchInput = document.getElementById("song-search");
songSearchInput.addEventListener('input', (e) => {
    searchAudio(e.target.value);
});
