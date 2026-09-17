import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

export default function Register() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState('Guest')
  const navigate = useNavigate()

  async function handleSubmit(event) {
    // Create the Firebase account first, then create the matching Firestore
    // profile that stores learning progress and personalized priorities.
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const userId = user.uid

      await updateProfile(user, { displayName })

      await addDoc(collection(db, 'Users'), {
        // Keep a predictable initial schema so every learning workflow can
        // safely append data without special-case initialization.
        userId,
        userName: displayName,
        score: 0,
        achievements: [],
        needToBlurt: [],
        needToLearn:[],
        clynxData:[],
        completedLearning: [],
        blurtMaterials: ''
      })

      navigate(`/dashboard/${userId}`)
    } catch (firebaseError) {
      setError(firebaseError.message || 'Unable to create your account. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="screen-shell">
      <main className="hero-auth-container">
      <h1>Create your SwiftScope account</h1>
      <p>Register to save your learning progress and build better study habits.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="register-name">Display name</label>
          <input
            id="register-name"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            value={displayName === 'Guest' ? '' : displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            minLength="6"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            minLength="6"
            required
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
      </main>
    </div>
  )
}
