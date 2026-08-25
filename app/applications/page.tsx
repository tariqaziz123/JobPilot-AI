"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getApplications, updateApplicationStatus, getApplicationById, deleteApplication } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  notes: string | null;

  job: {
    id: string;
    company: string;
    title: string;
    location: string | null;
    jobUrl: string | null;
  };
};

const applicationStatuses = [
  "Applied",
  "Screening",
  "Interview",
  "Assessment",
  "Offer",
  "Rejected",
] as const;

type ApplicationStatus = (typeof applicationStatuses)[number];

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "applied":
      return "border-blue-800 bg-blue-950/40 text-blue-400";

    case "screening":
      return "border-cyan-800 bg-cyan-950/40 text-cyan-400";

    case "interview":
      return "border-purple-800 bg-purple-950/40 text-purple-400";

    case "assessment":
      return "border-amber-800 bg-amber-950/40 text-amber-400";

    case "offer":
      return "border-emerald-800 bg-emerald-950/40 text-emerald-400";

    case "rejected":
      return "border-red-800 bg-red-950/40 text-red-400";

    default:
      return "border-slate-700 bg-slate-900 text-slate-400";
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<
    ApplicationStatus | "All"
  >("All");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] =
  useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      const token = getToken();

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const result = await getApplications(token);

        setApplications(result.data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load applications");
        }
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

async function handleStatusChange(
  applicationId: string,
  status: string
) {
  const token = getToken();

  if (!token) {
    window.location.href = "/login";
    return;
  }

  setUpdatingStatusId(applicationId);
  setError("");

  try {
    const result = await updateApplicationStatus(
      token,
      applicationId,
      status
    );

    setApplications((current) =>
      current.map((application) =>
        application.id === applicationId
          ? result.data
          : application
      )
    );

    if (selectedApplication?.id === applicationId) {
      setSelectedApplication(result.data);
    }
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to update application status"
    );
  } finally {
    setUpdatingStatusId(null);
  }
}

  async function handleViewDetails(
    applicationId: string
  ) {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setDetailsLoadingId(applicationId);
    setError("");

    try {
      const result = await getApplicationById(
        token,
        applicationId
      );

      setSelectedApplication(result.data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load application"
      );
    } finally {
      setDetailsLoadingId(applicationId);
    }
  }

  const filteredApplications = applications.filter(
    (application) =>
      selectedStatus === "All" ||
      application.status.toUpperCase() === selectedStatus.toUpperCase()
  );

  async function handleDeleteApplication(applicationId: string) {
    const token = getToken();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this application? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(applicationId);
    setError("");

    try {
      await deleteApplication(token, applicationId);

      setApplications((current) =>
        current.filter(
          (application) => application.id !== applicationId
        )
      );

      // If you have selected/viewed application state,
      // clear it here as well.
      setSelectedApplication(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete application"
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-slate-400">
          Loading applications...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-blue-400">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Applications
          </h1>

          <p className="mt-2 text-slate-400">
            Track all the jobs you've applied to.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div
          className="mt-8 flex flex-wrap gap-2"
          aria-label="Filter applications by status"
        >
          {(["All", ...applicationStatuses] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {applications.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No applications yet
            </h2>

            <p className="mt-2 text-slate-400">
              Apply to a job from the Jobs page and it will appear here.
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No {selectedStatus.toLowerCase()} applications
            </h2>

            <p className="mt-2 text-slate-400">
              Try another status to see more applications.
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
                      Applied
                    </th>
                    <th className="px-6 py-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {application.job.company}
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        {application.job.title}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {application.job.location || "—"}
                      </td>

                      <td className="px-6 py-4">
  <div className="flex flex-col gap-2">
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
        application.status
      )}`}
    >
      {application.status}
    </span>

    <select
      value={application.status}
      onChange={(event) =>
        handleStatusChange(
          application.id,
          event.target.value
        )
      }
      disabled={updatingStatusId === application.id}
      className="w-fit rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {applicationStatuses.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  </div>
</td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewDetails(application.id)
                          }
                          disabled={detailsLoadingId === application.id}
                          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-blue-500 hover:text-white"
                        >
                          {detailsLoadingId === application.id
                            ? "Loading..."
                            : "View Details"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteApplication(application.id)
                          }
                          disabled={deletingId === application.id}
                          className="rounded-lg border border-red-800 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === application.id
                            ? "Deleting..."
                            : "Delete Application"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedApplication && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <button
      type="button"
      aria-label="Close application details"
      onClick={() => setSelectedApplication(null)}
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
    />

    {/* Modal */}
    <section className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-6">
        <div>
          <p className="text-sm font-medium text-blue-400">
            Application Details
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {selectedApplication.job.title}
          </h2>

          <p className="mt-1 text-slate-400">
            {selectedApplication.job.company}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedApplication(null)}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Status
            </p>

            <span
              className={`mt-3 inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${getStatusClasses(
                selectedApplication.status
              )}`}
            >
              {selectedApplication.status}
            </span>
          </div>

          {/* Applied */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Applied
            </p>

            <p className="mt-3 text-sm text-slate-300">
              {new Date(
                selectedApplication.appliedAt
              ).toLocaleDateString()}
            </p>
          </div>

          {/* Location */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Location
            </p>

            <p className="mt-3 text-sm text-slate-300">
              {selectedApplication.job.location || "—"}
            </p>
          </div>

          {/* Job URL */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Job Posting
            </p>

            {selectedApplication.job.jobUrl ? (
              <a
                href={selectedApplication.job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Open Job Posting ↗
              </a>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No job URL available
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <h3 className="font-semibold text-white">
            Notes
          </h3>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
            {selectedApplication.notes || "No notes added."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-800 p-6">
        <button
          type="button"
          onClick={() => setSelectedApplication(null)}
          className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          Close
        </button>
      </div>
    </section>
  </div>
)}
      </div>
    </DashboardLayout>
  );
}
