import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import Logo from '@/components/ui/Logo'

export default function SignupPage() {
  const { signUp, user } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/dashboard', { replace: true })
    return null
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, displayName)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-paper text-sm placeholder-paper/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold'

  return (
    <div className="nebula-bg min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo height={110} />
        </div>
        <div className="bg-ink-soft border border-white/5 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-paper mb-1">Create account</h1>
          <p className="text-paper/50 text-sm mb-6">Join the UPCSG hub.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-paper/80 mb-1.5">Display name</label>
              <input type="text" required value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-paper/80 mb-1.5">
                Email <span className="text-paper/40 font-normal">(must be @up.edu.ph)</span>
              </label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-paper/80 mb-1.5">Password</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-ink py-2.5 rounded-lg font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-paper/50">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-soft font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
