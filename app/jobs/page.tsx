import DashboardLayout from "@/components/layout/DashboardLayout";

export default function JobsPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Job Applications
            </h1>

            <p className="mt-2 text-slate-400">
              Track and manage your job applications.
            </p>
          </div>

          <button className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500">
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
    </DashboardLayout>
  );
}