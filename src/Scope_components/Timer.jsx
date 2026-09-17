import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { playAlarm, prepareAlarm, stopAlarm } from "../Audio/AlarmSound"
import "./Scope.css"

export default function BlurtTimer() {
    const { userId } = useParams()
    const [seconds, setSeconds] = useState(300)

    useEffect(() => {
        // Scope gives the learner a focused five-minute recall window before
        // asking them to rewrite what they remember from memory.
        if (seconds === 0) return undefined
        const timer = window.setInterval(() => {
            setSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [seconds])

    // Warm the alarm up during the recall window so it can ring immediately.
    useEffect(() => {
        prepareAlarm()
    }, [])

    // Ring the alarm when the five-minute window ends, and silence it on exit.
    useEffect(() => {
        if (seconds > 0) return undefined

        playAlarm()

        return () => stopAlarm()
    }, [seconds])

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = String(seconds % 60).padStart(2, "0")

    return (
        <div className="scope-page">
            <main className="blurt-timer-hero">
                <h1>Blurting session</h1>
                <p className={seconds === 0 ? "is-finished" : undefined}>
                    {minutes}:{remainingSeconds}
                </p>
                    <Link className="link-end" to={`/dashboard/${userId}/scopecontents/timer/rewrite`}>Rewrite what you remember</Link>
            </main>
        </div>
)}
