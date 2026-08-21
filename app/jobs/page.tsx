"use client";

import { FormEvent, useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { createJob, getJobs, updateJobStatus, createApplication, analyzeJob } from "@/lib/api";
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

type JobAnalysis = {
  matchScore: number;
  atsScore: number;
  skillsMatched: string[];
  missingSkills: string[];
  recommendation: string;
  analysisId: string;
  jobId: string;
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
  const [description, setDescription] = useState("");
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

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
        description,
        salary: salary || undefined,
        source: source || undefined,
      });

      setCompany("");
      setTitle("");
      setLocation("");
      setJobUrl("");
      setDescription("");
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

  async function handleStatusChange(
    jobId: string,
    status: string
  ) {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      await updateJobStatus(token, jobId, status);

      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update job status");
      }
    }
  }

  async function handleApply(jobId: string) {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      await createApplication(token, {
        jobId,
        status: "APPLIED",
      });

      await updateJobStatus(token, jobId, "APPLIED");

      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to apply for job");
      }
    }
  }

  async function handleAnalyzeJob(jobId: string) {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setAnalyzingJobId(jobId);
    setError("");

    try {
      const result = await analyzeJob(token, jobId);

      setAnalysis(result.data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to analyze job");
      }
    } finally {
      setAnalyzingJobId(null);
    }
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

        {analysis && (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-400">
                  AI Job Analysis
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  Job Match Results
                </h2>
              </div>

              <button
                onClick={() => setAnalysis(null)}
                className="text-sm text-slate-400 transition hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Match Score
                </p>

                <p className="mt-2 text-3xl font-bold text-green-400">
                  {analysis.matchScore}%
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  ATS Score
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-400">
                  {analysis.atsScore}%
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-white">
                  Skills Matched
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.skillsMatched.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Missing Skills
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-300"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-green-400">
                      No major missing skills 🎉
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-semibold text-white">
                Recommendation
              </h3>

              <p className="mt-2 leading-7 text-slate-300">
                {analysis.recommendation}
              </p>
            </div>
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
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-300">
                  Job Description *
                </label>

                <textarea
                  required
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Paste the complete job description here..."
                  rows={8}
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

                    <th className="px-6 py-4 font-medium">
                      Actions
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
                        <select
                          value={job.status}
                          onChange={(event) =>
                            handleStatusChange(
                              job.id,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                        >
                          <option value="SAVED">Saved</option>
                          <option value="APPLIED">Applied</option>
                          <option value="INTERVIEW">Interview</option>
                          <option value="OFFER">Offer</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {job.source || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {job.status === "SAVED" ? (
                            <button
                              onClick={() => handleApply(job.id)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
                            >
                              Apply
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500">
                              Applied
                            </span>
                          )}

                          <button
                            onClick={() => handleAnalyzeJob(job.id)}
                            disabled={analyzingJobId === job.id}
                            className="rounded-lg border border-purple-500/50 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {analyzingJobId === job.id
                              ? "Analyzing..."
                              : "Analyze AI"}
                          </button>
                        </div>
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