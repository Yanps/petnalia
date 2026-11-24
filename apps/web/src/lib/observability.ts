/**
 * Reports an unexpected error caught by an error boundary. Single entry point so the
 * error-tracking backend can change without touching the boundaries.
 */
export function reportError(error: unknown): void {
  console.error(error);
}
