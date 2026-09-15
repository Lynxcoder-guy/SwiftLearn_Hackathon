import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

export default function BlurtTimer() {
    const { userId } = useParams()
    const [seconds, setSeconds] = useState(300)

    useEffect(() => {
        if (seconds === 0) return undefined
        const timer = window.setInterval(() => {
            setSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0))
        }, 1000)
        return () => window.clearInterval(timer)
    }, [seconds])

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = String(seconds % 60).padStart(2, "0")

    return (
        <main>
            <h1>Blurting session</h1>
            <p>{minutes}:{remainingSeconds}</p>
            <Link to={`/dashboard/${userId}/scopecontents/timer/rewrite`}>Rewrite what you remember</Link>
        </main>
    )
}