"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getMe, updateMe } from "@/lib/api";
import { getToken } from "@/lib/auth";

type User = {
    id: string;
    name: string | null;
    email: string;
    skills: string[];
    resumeText: string | null;
    createdAt: string;
};

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");
    const [skills, setSkills] = useState("");
    const [resumeText, setResumeText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadProfile() {
            const token = getToken();

            if (!token) {
                window.location.href = "/login";
                return;
            }

            try {
                const result = await getMe(token);

                setUser(result.data);
                setName(result.data.name || "");
                setSkills(result.data.skills?.join(", ") || "");
                setResumeText(result.data.resumeText || "");
            } catch {
                localStorage.removeItem("jobpilot_token");
                window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        const token = getToken();

        if (!token) {
            window.location.href = "/login";
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            const skillsArray = skills
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);

            const result = await updateMe(token, {
                name,
                skills: skillsArray,
                resumeText,
            });

            setUser(result.data);
            setName(result.data.name || "");
            setSkills(result.data.skills?.join(", ") || "");
            setResumeText(result.data.resumeText || "");
            setMessage("Profile updated successfully.");
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to update profile."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <p className="text-slate-400">
                    Loading settings...
                </p>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <p className="text-sm font-medium text-blue-400">
                        Account
                    </p>

                    <h1 className="mt-2 text-3xl font-bold">
                        Settings
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Manage your JobPilot account and profile.
                    </p>
                </div>

                <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold">
                        Profile
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                        Update your personal information.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 space-y-5"
                    >
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={user.email}
                                disabled
                                className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-500"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Email changes are currently disabled.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="skills"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Skills
                            </label>

                            <input
                                id="skills"
                                type="text"
                                value={skills}
                                onChange={(event) =>
                                    setSkills(event.target.value)
                                }
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                placeholder="React.js, JavaScript, TypeScript, Redux, Next.js"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Separate each skill with a comma.
                            </p>
                        </div>
                        <div>
                            <label
                                htmlFor="resume"
                                className="block text-sm font-medium text-slate-300"
                            >
                                Resume
                            </label>

                            <textarea
                                id="resume"
                                value={resumeText}
                                onChange={(event) =>
                                    setResumeText(event.target.value)
                                }
                                rows={12}
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                placeholder="Paste your resume text here..."
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Your resume information will be used by JobPilot AI when analyzing jobs.
                            </p>
                        </div>
                        {message && (
                            <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </section>

                <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold">
                        Account Information
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                User ID
                            </p>

                            <p className="mt-1 break-all text-sm text-slate-300">
                                {user.id}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                                Member Since
                            </p>

                            <p className="mt-1 text-sm text-slate-300">
                                {new Date(
                                    user.createdAt
                                ).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}