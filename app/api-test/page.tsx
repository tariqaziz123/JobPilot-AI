"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/lib/api";

export default function ApiTestPage() {
  const [jobs, setJobs] = useState<unknown[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await getJobs(
          "cmt05xye100009sql8mriveqy"
        );

        setJobs(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to connect to API");
      }
    }

    loadJobs();
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        JobPilot API Test
      </h1>

      {error && (
        <p className="mt-4 text-red-500">
          {error}
        </p>
      )}

      <pre className="mt-6 rounded-lg bg-gray-100 p-4">
        {JSON.stringify(jobs, null, 2)}
      </pre>
    </main>
  );
}