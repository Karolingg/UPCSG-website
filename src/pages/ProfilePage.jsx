import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'

export default function ProfilePage() {
  const { user, profile, roles } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id)
    setSaving(false)
    setMessage(error ? error.message : 'Saved.')
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-paper">Profile &amp; Settings</h1>

      <div className="mt-8 max-w-lg bg-surface rounded-xl p-6 border border-white/5">
        <div className="mb-5">
          <p className="text-sm text-paper/50">Email</p>
          <p className="font-medium text-paper">{user?.email}</p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-paper/50 mb-2">Roles</p>
          {roles.length === 0 ? (
            <p className="text-sm text-paper/40">No roles assigned</p>
          ) : (
            roles.map(r => (
              <span key={r.id} className="inline-block bg-gold/15 text-gold text-xs font-semibold px-2.5 py-1 rounded-full mr-2 mb-1">
                {r.role}{r.event_id ? ` · event ${r.event_id}` : ''}
              </span>
            ))
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-paper/80 mb-1.5">Display name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
          {message && (
            <p className={`text-sm ${message === 'Saved.' ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="bg-gold text-ink px-5 py-2 rounded-lg font-bold hover:bg-gold-soft transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
