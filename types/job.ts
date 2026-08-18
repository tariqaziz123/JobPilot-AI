export type JobStatus =
  | "SAVED"
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTED";

export type Job = {
  id: string;
  company: string;
  position: string;
  location?: string;
  jobUrl?: string;
  status: JobStatus;
  appliedAt?: string;
  createdAt: string;
};