export type JobStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTED";

type Job = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  jobUrl: string | null;
  description: string | null;
  salary: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};