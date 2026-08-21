import { analyzeJobMatch } from "./services/ai.service.js";

async function main() {
  const candidateProfile = `
React.js
JavaScript
TypeScript
Redux
HTML
CSS
REST APIs
Next.js
`;

  const jobDescription = `
We are looking for a Frontend Developer with strong experience in
React.js, JavaScript, TypeScript, HTML, CSS, Redux and GraphQL.
Experience with Next.js is preferred.
`;

  const result = await analyzeJobMatch(
    candidateProfile,
    jobDescription
  );

  console.log("Job analysis:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("Gemini test failed:", error);
  process.exit(1);
});