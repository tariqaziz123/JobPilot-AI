"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getApplications } from "@/lib/api";
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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
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

        {applications.length === 0 ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <h2 className="text-xl font-semibold">
              No applications yet
            </h2>

            <p className="mt-2 text-slate-400">
              Apply to a job from the Jobs page and it will appear here.
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
                  {applications.map((application) => (
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
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                          {application.status}
                        </span>
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