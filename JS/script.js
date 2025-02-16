let currentSong = new Audio
let songs;
let currFolder;
function secondsConverter(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const min = Math.floor(seconds / 60);
    const remainingsec = Math.floor(seconds % 60);

    const formattedmin = String(min).padStart(2, "0");
    const formattedsec = String(remainingsec).padStart(2, "0")
    return ` ${formattedmin}:${formattedsec} `
}
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://192.168.1.38:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // Show all the sings in the Playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img src="img/music.svg" alt="">
                                    <div class="info">
                                        <div>${song.replaceAll("%20", " ")}</div>
                                        <div>Ronin</div>
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img src="img/play.svg" alt=""></div></li>`
    }
    //Attach an Event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs
}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
// Display all the albums on the page
async function displayAlbums() {
    let a = await fetch(`http://192.168.1.38:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")&& !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            //Get the meta data of the folder
            let a = await fetch(`http://192.168.1.38:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div  class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141b34" stroke-width="1.5"
                                    stroke-linejoin="round" fill="black">
                                </path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    //Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    
    })
}

async function main() {
    // Get all the songs
    await getSongs("songs")
    playMusic(songs[0], true)
    // Display all the albums on the page
    displayAlbums()





    // Attach an event listener to play ,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsConverter(currentSong.currentTime)} / ${secondsConverter(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / Math.floor(e.target.getBoundingClientRect().width) * 100);
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100
    })
    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-1100%"
    })
    //Add an event listener to previous nad next
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //Add an event to valume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })
    // Add event listener to mute the track
    document.querySelector(".valume>img").addEventListener("click", e => {
        if (e.target.src.includes("valume.svg")) {
            e.target.src = e.target.src.replace("valume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "valume.svg")
            currentSong.volume = .2;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })


}
main()