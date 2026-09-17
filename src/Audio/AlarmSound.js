// One shared audio element so every timer in the app (the dashboard priority
// timer and the Scope blurt timer) rings the same bundled asset instead of
// loading its own copy of the file.
import alarmSource from "./Alarm.mp3";

let alarmAudio = null;

function getAlarmAudio() {
    if (alarmAudio) return alarmAudio;

    alarmAudio = new Audio(alarmSource);
    alarmAudio.preload = "auto";

    return alarmAudio;
}

/**
 * Warm the alarm up while the learner is still reading the screen, so the
 * countdown can ring instantly when it reaches zero.
 */
export function prepareAlarm() {
    const audio = getAlarmAudio();

    if (audio.readyState === 0) audio.load();

    return audio;
}

/** Ring the alarm from the start every time a countdown reaches zero. */
export function playAlarm() {
    const audio = getAlarmAudio();

    if (audio.readyState > 0) audio.currentTime = 0;

    const playback = audio.play();

    // Browsers block playback until the document has seen a user interaction.
    // Every timer is reached through a click, so this is a safety net only.
    if (playback?.catch) {
        playback.catch((error) => {
            console.warn("[AlarmSound] Alarm could not play:", error.message);
        });
    }
}

/** Silence the alarm when the learner leaves the timer screen. */
export function stopAlarm() {
    if (!alarmAudio) return;

    alarmAudio.pause();
    if (alarmAudio.readyState > 0) alarmAudio.currentTime = 0;
}
