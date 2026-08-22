const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type LoginData = {
  email: string;
  password: string;
};

type SignupData = {
  name: string;
  email: string;
  password: string;
};

export async function signup(data: SignupData) {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Signup failed");
  }

  return result;
}

export async function login(data: LoginData) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login failed");
  }

  return result;
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch user");
  }

  return result;
}

export async function getJobs(token: string) {
  const response = await fetch(`${API_URL}/api/jobs`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch jobs");
  }

  return result;
}

export async function analyzeJob(
  token: string,
  jobId: string
) {
  const response = await fetch(
    `${API_URL}/api/ai/analyze-job`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        jobId,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to analyze job"
    );
  }

  return result;
}

export async function createJob(
  token: string,
  data: {
    company: string;
    title: string;
    location?: string;
    jobUrl?: string;
    description?: string;
    salary?: string;
    source?: string;
  }
) {
  const response = await fetch(`${API_URL}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create job");
  }

  return result;
}

export async function getHealth() {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Failed to connect to JobPilot API");
  }

  return response.json();
}

export async function updateJobStatus(
  token: string,
  jobId: string,
  status: string
) {
  const response = await fetch(
    `${API_URL}/api/jobs/${jobId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to update job status"
    );
  }

  return response.json();
}

export async function createApplication(
  token: string,
  data: {
    jobId: string;
    status?: string;
    notes?: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/applications`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to create application"
    );
  }

  return response.json();
}

export async function getApplications(token: string) {
  const response = await fetch(
    `${API_URL}/api/applications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to fetch applications"
    );
  }

  return response.json();
}

export async function getDashboardStats(token: string) {
  const response = await fetch(
    `${API_URL}/api/dashboard/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to fetch dashboard stats"
    );
  }

  return response.json();
}

export async function getAnalytics(token: string) {
  const response = await fetch(
    `${API_URL}/api/analytics`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to fetch analytics"
    );
  }

  return response.json();
}

export async function updateMe(
  token: string,
  data: {
    name: string;
    skills: string[];
    resumeText: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/users/me`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to update profile"
    );
  }

  return response.json();
}

export async function getAIAnalyses(
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/ai/analyses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to fetch AI analyses"
    );
  }

  return result;
}

export async function analyzeResume(token: string) {
  const response = await fetch(
    `${API_URL}/api/ai/analyze-resume`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to analyze resume"
    );
  }

  return result;
}

export async function getResumeAnalyses(
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/ai/resume-analyses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch resume analyses"
    );
  }

  return result;
}

export async function getJobRecommendations(
  token: string
) {
  const response = await fetch(
    `${API_URL}/api/ai/job-recommendations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch job recommendations"
    );
  }

  return result;
}

export async function updateApplicationStatus(
  token: string,
  applicationId: string,
  status: string
) {
  const response = await fetch(
    `${API_URL}/api/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
      }),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ||
        "Failed to update application status"
    );
  }

  return response.json();
}

export async function getApplicationById(
  token: string,
  applicationId: string
) {
  const response = await fetch(
    `${API_URL}/api/applications/${applicationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ||
        "Failed to fetch application"
    );
  }

  return response.json();
}

export async function updateApplication(
  token: string,
  applicationId: string,
  data: {
    status?: string;
    notes?: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/applications/${applicationId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to update application"
    );
  }

  return response.json();
}

export async function deleteApplication(
  token: string,
  applicationId: string
) {
  const response = await fetch(
    `${API_URL}/api/applications/${applicationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to delete application"
    );
  }

  return response.json();
}