// One shared looping lofi track for the whole app. Keeping the audio element in
// this module (instead of inside a component) means every screen controls the
// same playback, the music keeps playing while the learner navigates, and
// React's StrictMode double mount cannot start two copies of the track.
import lofiSource from "./Lofi1.mp3";

let lofiAudio = null;
let isPlaying = false;
const listeners = new Set();

function getLofiAudio() {
    if (lofiAudio) return lofiAudio;

    // The element is created on the first click, so the track is only
    // downloaded when the learner actually asks for music.
    lofiAudio = new Audio(lofiSource);
    lofiAudio.loop = true; // study music should never stop mid-session
    lofiAudio.preload = "auto";
    lofiAudio.volume = 0.45; // sits under the timer alarm instead of hiding it

    // The element stays the source of truth so the button always reflects the
    // real playback state, even when the browser blocks a play() request.
    lofiAudio.addEventListener("play", () => setPlaying(true));
    lofiAudio.addEventListener("pause", () => setPlaying(false));

    return lofiAudio;
}

function setPlaying(nextIsPlaying) {
    if (isPlaying === nextIsPlaying) return;

    isPlaying = nextIsPlaying;
    listeners.forEach((listener) => listener(isPlaying));
}

/**
 * Watch the playback state from React. The listener is called immediately with
 * the current value, and the returned function unsubscribes it.
 */
export function subscribeToLofi(listener) {
    listeners.add(listener);
    listener(isPlaying);

    return () => {
        listeners.delete(listener);
    };
}

export function playLofi() {
    const audio = getLofiAudio();
    const playback = audio.play();

    // Browsers block playback until the document has seen a user interaction.
    // The button click counts as one, so this is a safety net only.
    if (playback?.catch) {
        playback.catch((error) => {
            console.warn("[LofiMusic] Music could not play:", error.message);
        });
    }
}

export function pauseLofi() {
    if (!lofiAudio) return;

    lofiAudio.pause();
}

/** Flip the loop on or off — this is what the fixed music button calls. */
export function toggleLofi() {
    if (isPlaying) {
        pauseLofi();
        return;
    }

    playLofi();
}