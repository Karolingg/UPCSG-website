import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const { user, profile, roles } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return
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

      <div className="mt-8 max-w-lg">
        <Card>
          <div className="mb-5">
            <p className="text-sm text-paper/50">Email</p>
            <p className="font-medium text-paper">{user?.email}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-paper/50 mb-2">Roles</p>
            {roles.length === 0 ? (
              <p className="text-sm text-paper/40">No roles assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {roles.map(r => (
                  <Pill key={r.id}>
                    {r.role}{r.event_id ? ` · event ${r.event_id}` : ''}
                  </Pill>
                ))}
              </div>
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
            <Button type="submit" disabled={saving} className="px-5 py-2">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
