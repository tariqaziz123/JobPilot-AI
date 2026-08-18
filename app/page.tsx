import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300">
          AI-powered job search assistant
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
          Manage your job search with{" "}
          <span className="text-blue-400">AI.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Track applications, analyze resumes, generate tailored cover letters,
          and prepare for interviews from one powerful workspace.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500"
          >
            Open Dashboard
          </Link>

          <button className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-900">
            Learn More
          </button>
        </div>
      </section>
    </main>
  );
}