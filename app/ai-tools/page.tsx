"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
    getJobs,
    getAIAnalyses,
    getResumeAnalyses,
    getCoverLetters,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
    Job,
    AnalysisHistory,
    ResumeAnalysis,
    CoverLetter,
} from "./types";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import CoverLetterGenerator from "./components/CoverLetterGenerator";
import InterviewPreparation from "./components/InterviewPreparation";
import MockInterview from "./components/MockInterview";
import JobRecommendations from "./components/JobRecommendations";
import JobAnalyzer from "./components/JobAnalyzer";

function AIToolsContent() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [history, setHistory] = useState<AnalysisHistory[]>([]);
    const [resumeHistory, setResumeHistory] = useState<ResumeAnalysis[]>([]);
    const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

    const searchParams = useSearchParams();
    const jobIdFromUrl = searchParams.get("jobId");

    useEffect(() => {
        async function loadData() {
            const token = getToken();

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const [jobsResult, analysesResult] =
                    await Promise.all([
                        getJobs(token),
                        getAIAnalyses(token),
                    ]);

                const jobsWithDescription =
                    jobsResult.data.filter(
                        (job: Job) => job.description?.trim()
                    );

                setJobs(jobsWithDescription);
                setHistory(analysesResult.data);

                const resumeResult =
                    await getResumeAnalyses(token);
                setResumeHistory(resumeResult.data);

                const coverLetterResult =
                    await getCoverLetters(token);
                setCoverLetters(coverLetterResult.data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load AI Tools"
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    useEffect(() => {
        if (!jobIdFromUrl || jobs.length === 0) {
            return;
        }

        const jobExists = jobs.some(
            (job) => job.id === jobIdFromUrl
        );

        if (jobExists) {
            setSelectedJobId(jobIdFromUrl);
        }
    }, [jobIdFromUrl, jobs]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8 text-slate-400">
                    Loading AI Tools...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <p className="text-sm font-medium text-blue-400">
                    AI Tools
                </p>

                {error && (
                    <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <ResumeAnalyzer
                    resumeHistory={resumeHistory}
                    setResumeHistory={setResumeHistory}
                />

                <CoverLetterGenerator
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                    coverLetters={coverLetters}
                    setCoverLetters={setCoverLetters}
                />

                <InterviewPreparation
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                />

                <MockInterview
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                />

                <JobRecommendations />

                <JobAnalyzer
                    jobs={jobs}
                    selectedJobId={selectedJobId}
                    setSelectedJobId={setSelectedJobId}
                    history={history}
                    setHistory={setHistory}
                />
            </div>
        </DashboardLayout>
    );
}

function AIToolsLoading() {
    return (
        <DashboardLayout>
            <div className="p-8 text-slate-400">
                Loading AI Tools...
            </div>
        </DashboardLayout>
    );
}

export default function AIToolsPage() {
    return (
        <Suspense fallback={<AIToolsLoading />}>
            <AIToolsContent />
        </Suspense>
    );
}
