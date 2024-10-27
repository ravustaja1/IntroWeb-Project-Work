// Empty array for audio samples
const samples = []

// Audio samples pushed to the array
samples.push({src: "audio/bass.mp3", name: "Bass", duration: 7})
samples.push({src: "audio/drum.mp3", name: "Drum", duration: 1})
samples.push({src: "audio/guitar.mp3", name: "Guitar", duration: 3})
samples.push({src: "audio/piano.mp3", name: "Piano", duration: 34})
samples.push({src: "audio/silence.mp3", name: "Silence", duration: 2})
samples.push({src: "audio/strange-beat.mp3", name: "Strange-beat", duration: 7})
samples.push({src: "audio/violin.mp3", name: "Violin", duration: 6})


// Arrays for tracks, track default volumes and currently playing audio
let tracks = []
let trackVolumes = [1, 1, 1, 1]
let playingAudios = []

const tracksDiv = document.getElementById("tracks")


// Add 4 tracks in the beginning
for (let i = 0; i < 4; i++) {
    addTrack()
}

// Button for adding tracks. When you click the button addTrack() -function is called
const addTrackButton = document.getElementById("add-track")
addTrackButton.addEventListener("click", addTrack)

// Function responsible for creating a new track
// It creates the div element containing Track number, Volume label & slider
function addTrack() {
    const trackIndex = tracks.length
    tracks.push([]) // Add an empty track
    trackVolumes.push(1) // Default volume for the new track

    let trackDiv = document.createElement("div")
    trackDiv.setAttribute("id", "trackDiv" + trackIndex)
    trackDiv.classList.add("track")

    let trackDivHeader = document.createElement("h2")
    trackDivHeader.innerText = "Track " + (trackIndex + 1)
    trackDiv.appendChild(trackDivHeader)

    let volumeLabel = document.createElement("label")
    volumeLabel.innerText = "Volume"
    trackDiv.appendChild(volumeLabel)

    let volumeSlider = document.createElement("input")
    volumeSlider.type = "range"
    volumeSlider.min = "0"
    volumeSlider.max = "1"
    volumeSlider.step = "0.1"
    volumeSlider.classList.add("volume-slider")
    volumeSlider.value = trackVolumes[trackIndex]

    volumeSlider.addEventListener("input", (event) => {
        trackVolumes[trackIndex] = parseFloat(event.target.value)
    })

    trackDiv.appendChild(volumeSlider)


    // Event listeners for drag-and-drop for adding new samples to the track
    trackDiv.addEventListener("dragover", (event) => event.preventDefault())
    trackDiv.addEventListener("drop", (event) => addSample(event, trackIndex))

    tracksDiv.appendChild(trackDiv)

}

// Reference to add addButtons in the html file
const addButtons = document.getElementById("addButtons")
let id = 0


// Here the draggable buttons are created for each sample
samples.forEach((sample) => {
    let newButton = document.createElement("button")
    newButton.setAttribute("data-id", id++)
    newButton.setAttribute("draggable", "true")
    newButton.innerText = sample.name

    // Event listener for Desktop device dragging
    newButton.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("sampleId", newButton.dataset.id)
    })

    // Event listener for mobile devices when the button is pressed
    newButton.addEventListener("touchstart", (event) => {
        const touch = event.touches[0]
        event.target.dataset.touchStartId = newButton.dataset.id
        newButton.style.position = "absolute"
        newButton.style.zIndex = "1000"
        newButton.style.left = touch.pageX + "px"
        newButton.style.top = touch.pageY + "px"
    })

    // Event listener for mobile devices when dragging the button
    newButton.addEventListener("touchmove", (event) => {
        const touch = event.touches[0]
        newButton.style.left = touch.pageX + "px"
        newButton.style.top = touch.pageY + "px"

    })

    // Event listener for mobile devices when you release dragging the button
    newButton.addEventListener("touchend", (event) => {
        let targetElement = document.elementFromPoint(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
        )

        if (targetElement && targetElement.classList.contains("track")) {
            addSampleMobile(event, parseInt(targetElement.id.replace("trackDiv", "")))
        }

        newButton.style.position = "static"
        newButton.style.zIndex = "1"
    })

    addButtons.appendChild(newButton)
})


// This is a specific function to handle dropping of samples to a track on mobile devices
function addSampleMobile(event, trackNumber) {
    const sampleId = event.target.dataset.touchStartId

    if (sampleId != null) {
        const sample = samples[sampleId]
        tracks[trackNumber].push(sample)

        let trackDiv = document.getElementById("trackDiv" + trackNumber)
        let newItem = document.createElement("div")
        newItem.innerText = sample.name

        newItem.classList.add("track-item")
        newItem.style.width = sample.duration * 5 + "px"
        newItem.setAttribute("title", `Duration: ${sample.duration} sec`)

        trackDiv.appendChild(newItem)
    }
}


// This function handles the samples dropped on track
function addSample(event, trackNumber) {
    event.preventDefault()
    const sampleId = event.dataTransfer.getData("sampleId")

    if (sampleId !== null) {
        const sample = samples[sampleId]
        tracks[trackNumber].push(samples[sampleId])

        let trackDiv = document.getElementById("trackDiv" + trackNumber)
        let newItem = document.createElement("div")
        newItem.innerText = samples[sampleId].name

        // Visual properties for the sample (Hover sample for dutation)
        newItem.classList.add("track-item")
        newItem.style.width = sample.duration * 10 + "px"
        newItem.setAttribute("title", `Duration: ${sample.duration} sec`)

        trackDiv.appendChild(newItem)
    }
}


// Reference for Play and Stop buttons in html file
const playButton = document.getElementById("play")
const stopButton = document.getElementById("stop")

// Function calls when the Play/Stop buttons are pressed
playButton.addEventListener("click", () => playSong())
stopButton.addEventListener("click", () => stopSong())

// Function for playing the song. First currently played song is stopped by calling stopSong()
// and then for each track playTrack() is called
function playSong() {
    stopSong()
    tracks.forEach((track, i) => {
        if (track.length > 0) {
            playTrack(track, i)
        }
    })
}


// Function for stopping all currently playing audio and resetting the "currently playing array"
function stopSong(){
    playingAudios.forEach((audio) => {
        if (audio) {
            audio.pause()
            audio.currentTime = 0
        }
    })

    playingAudios = []
}


// This function is used to play each track. All samples are looped through
function playTrack(track, trackNumber) {
    let audio = new Audio()
    let i = 0

    audio.src = track[0].src
    audio.volume = trackVolumes[trackNumber]


    playingAudios[trackNumber] = audio

    audio.addEventListener("ended", () => {
        i = ++i < track.length ? i : 0
        audio.src = track[i].src
        audio.volume = trackVolumes[trackNumber]
        audio.play()
    })

    audio.play()
}