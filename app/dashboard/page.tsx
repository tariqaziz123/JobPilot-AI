const stats = [
  {
    label: "Total Applications",
    value: "24",
  },
  {
    label: "Interviews",
    value: "5",
  },
  {
    label: "Assessments",
    value: "3",
  },
  {
    label: "Offers",
    value: "1",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/dashboard" className="font-bold">
            JobPilot AI
          </a>

          <div className="flex gap-6 text-sm text-slate-400">
            <a href="/dashboard" className="hover:text-white">
              Dashboard
            </a>

            <a href="/jobs" className="hover:text-white">
              Jobs
            </a>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm text-blue-400">JobPilot AI</p>

          <h1 className="mt-2 text-3xl font-bold">
            Good morning, Tariq
          </h1>

          <p className="mt-2 text-slate-400">
            Here's an overview of your job search.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>

              <p className="mt-3 text-3xl font-bold">
                {stat.value}
              </p>
            </div>
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
    </main>
  );
}