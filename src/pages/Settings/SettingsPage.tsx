import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-paper">Settings</h1>

      <div className="mt-8 max-w-lg">
        <Card>
          <p className="text-sm text-paper/50">
            Settings will live here. More options coming soon.
          </p>
        </Card>
      </div>
    </PageLayout>
  )
}
