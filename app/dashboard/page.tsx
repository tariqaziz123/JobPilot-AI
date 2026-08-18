import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";

const stats = [
  {
    label: "Total Applications",
    value: 24,
    description: "All tracked applications",
  },
  {
    label: "Interviews",
    value: 5,
    description: "Upcoming and completed",
  },
  {
    label: "Assessments",
    value: 3,
    description: "Technical assessments",
  },
  {
    label: "Offers",
    value: 1,
    description: "Active offers",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-blue-400">
            Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Here's an overview of your job search.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </div>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Application Pipeline
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your application pipeline will appear here.
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}