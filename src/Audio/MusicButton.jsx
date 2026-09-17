import { useEffect, useState } from "react";
import { subscribeToLofi, toggleLofi } from "./LofiMusic";

/**
 * Fixed music control pinned to the top of every screen. It loops the bundled
 * lofi track with a single click, so learners can study with background music
 * without leaving the page they are on.
 */
export default function MusicButton() {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // The shared module owns the audio element; this only mirrors its state.
        return subscribeToLofi(setIsPlaying);
    }, []);

    const label = isPlaying ? "Pause lofi music" : "Play lofi music in loop";

    return (
        <div className="music-bar">
            <button
                type="button"
                className="music-toggle"
                aria-pressed={isPlaying}
                title={label}
                onClick={toggleLofi}
            >
                <span className="music-note" aria-hidden="true">♪</span>
                <span>{isPlaying ? "Lofi on" : "Lofi off"}</span>
            </button>
        </div>
    );
}