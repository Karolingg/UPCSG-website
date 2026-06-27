import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'

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
    'w-full bg-ink border border-white/15 rounded-lg px-3 py-2.5 text-paper text-sm placeholder-paper/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-colors'

  return (
    <div className="min-h-screen flex bg-ink">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex flex-col items-center justify-center w-2/5 shrink-0 bg-ink-soft border-r border-white/5 p-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(255,200,87,0.07),transparent)]" />
        <Logo height={148} className="relative" />
        <div className="relative mt-8 text-center">
          <h2 className="text-xl font-bold text-paper">UPCSG Hub</h2>
          <p className="text-paper/40 mt-2 text-sm leading-relaxed max-w-[200px]">
            Internal platform for the UP Computer Science Guild
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center flex-1 px-5 py-12 sm:px-10">
        <div className="lg:hidden mb-10">
          <Logo height={88} />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-paper">Create account</h1>
            <p className="text-paper/50 text-sm mt-1">Join the UPCSG hub.</p>
          </div>

          <div className="bg-ink-soft border border-white/8 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-paper/60 uppercase tracking-wider mb-1.5">Display name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-paper/60 uppercase tracking-wider mb-1.5">
                  Email <span className="text-paper/30 normal-case font-normal tracking-normal">(must be @up.edu.ph)</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@up.edu.ph"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-paper/60 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="At least 6 characters"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <Button type="submit" disabled={loading} className="w-full py-2.5 mt-1">
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </div>

          <p className="mt-5 text-sm text-center text-paper/40">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-soft font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
