import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'

export default function InternshipsPage() {
  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-paper">Internships</h1>

      <div className="mt-8 max-w-lg">
        <Card>
          <p className="text-sm text-paper/50">
            Internships will live here. Coming soon.
          </p>
        </Card>
      </div>
    </PageLayout>
  )
}
