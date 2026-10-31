import type { ZodError } from "zod";

/** Returns one friendly validation message, without echoing what the user typed. */
export function firstIssue(err: ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Please check the form and try again.";
  if (issue.code === "unrecognized_keys") return "Please check the form and try again.";
  if (issue.code === "invalid_value" || issue.code === "invalid_type") return "Please check the form and try again.";
  return issue.message || "Please check the form and try again.";
}
