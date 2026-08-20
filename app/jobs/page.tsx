"use client";

import { FormEvent, useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { createJob, getJobs } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Job = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  jobUrl: string | null;
  salary: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [salary, setSalary] = useState("");
  const [source, setSource] = useState("");

  async function loadJobs() {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const result = await getJobs(token);
      setJobs(result.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load jobs");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createJob(token, {
        company,
        title,
        location: location || undefined,
        jobUrl: jobUrl || undefined,
        salary: salary || undefined,
        source: source || undefined,
      });

      setCompany("");
      setTitle("");
      setLocation("");
      setJobUrl("");
      setSalary("");
      setSource("");

      setShowForm(false);

      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create job");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-slate-400">
          Loading jobs...
        </div>
      </DashboardLayout>
    );
  }

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

          <button
            onClick={() => setShowForm((value) => !value)}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            {showForm ? "Cancel" : "Add Job"}
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold">
              Add Job
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Company *
                </label>

                <input
                  required
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  placeholder="e.g. Microsoft"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Job Title *
                </label>

                <input
                  required
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Senior React Developer"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Location
                </label>

                <input
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Bangalore / Remote"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Salary
                </label>

                <input
                  value={salary}
                  onChange={(event) =>
                    setSalary(event.target.value)
                  }
                  placeholder="e.g. 12-18 LPA"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Source
                </label>

                <input
                  value={source}
                  onChange={(event) =>
                    setSource(event.target.value)
                  }
                  placeholder="e.g. LinkedIn"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Job URL
                </label>

                <input
                  type="url"
                  value={jobUrl}
                  onChange={(event) =>
                    setJobUrl(event.target.value)
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Job"}
              </button>
            </div>
          </form>
        )}

        {jobs.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No jobs yet
            </h2>

            <p className="mt-2 text-slate-400">
              Start tracking your job applications by adding your first job.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-sm text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">
                      Company
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Position
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Location
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Source
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {job.company}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {job.title}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {job.location || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                          {job.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {job.source || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}