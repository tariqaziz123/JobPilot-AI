"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getApplications, updateApplicationStatus } from "@/lib/api";
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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<
    ApplicationStatus | "All"
  >("All");
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application status"
      );
    }
  }

  const filteredApplications = applications.filter(
    (application) =>
      selectedStatus === "All" ||
      application.status.toUpperCase() === selectedStatus.toUpperCase()
  );

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
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStatus === status
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
                        <select
                          value={application.status}
                          onChange={(event) =>
                            handleStatusChange(
                              application.id,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-medium text-blue-400 outline-none focus:border-blue-500"
                        >
                          {applicationStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString()}
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
