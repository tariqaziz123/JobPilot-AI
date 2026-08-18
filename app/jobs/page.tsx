export default function JobsPage() {
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
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-400">JobPilot AI</p>

            <h1 className="mt-2 text-3xl font-bold">
              Job Applications
            </h1>

            <p className="mt-2 text-slate-400">
              Track and manage your job applications.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500">
            Add Job
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-semibold">
            No applications yet
          </h2>

          <p className="mt-2 text-slate-400">
            Start tracking your job applications by adding your first job.
          </p>
        </div>
      </div>
    </main>
  );
}