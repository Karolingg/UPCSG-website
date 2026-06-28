import { useAuth } from "@/context/auth-context";
import PageLayout from "@/components/layout/PageLayout";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";

export default function DashboardPage() {
  const { roles, isAdmin, isOfficer } = useAuth();

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-paper">Dashboard</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-paper/60 text-sm">Your roles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <span className="text-paper/40 text-sm">No roles assigned</span>
            ) : (
              roles.map((r) => <Pill key={r.id}>{r.role}</Pill>)
            )}
          </div>
        </Card>

        <Card to="/profile" hover>
          <p className="text-paper font-semibold">Profile &amp; settings</p>
          <p className="text-paper/60 text-sm mt-1">
            Edit your display name and details.
          </p>
        </Card>

        {(isAdmin() || isOfficer()) && (
          <Card to="/admin" hover>
            <p className="text-paper font-semibold">Admin panel</p>
            <p className="text-paper/60 text-sm mt-1">
              Manage events, news, and roles.
            </p>
          </Card>
        )}
      </div>

      <p className="text-paper/40 text-sm mt-10">
        More sections (Events, Announcements, Scholarships…) arrive in upcoming
        phases.
      </p>
    </PageLayout>
  );
}
