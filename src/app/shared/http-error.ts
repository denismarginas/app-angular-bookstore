import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Could not reach the server. Make sure the API server is running (npm start).';
    }

    if (error.error instanceof SyntaxError || error.error instanceof ProgressEvent) {
      return 'The server did not return a valid response. Make sure the API server is running (npm start) and reachable at http://localhost:3000.';
    }

    if (
      error.error &&
      typeof error.error === 'object' &&
      typeof (error.error as { message?: unknown }).message === 'string'
    ) {
      return (error.error as { message: string }).message;
    }
  }

  return fallback;
}
