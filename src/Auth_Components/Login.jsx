import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    // Firebase owns credential validation; this screen only manages form state
    // and routes an authenticated learner to their private dashboard.
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const userId = user.uid

      navigate(`/dashboard/${userId}`)
    } catch (firebaseError) {
      setError(firebaseError.message || 'Unable to log in. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="screen-shell">
      <main className="hero-auth-container">
      <h1>Log in to your account</h1>
      <p>Welcome back to SwiftScope. Enter your details to continue learning.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>
        Do not have an account? <Link to="/register">Create one</Link>
      </p>
      </main>
    </div>
  )
}
