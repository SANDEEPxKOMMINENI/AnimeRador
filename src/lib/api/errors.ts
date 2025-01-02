export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleError(error: unknown): never {
  if (error instanceof APIError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new APIError(error.message);
  }

  throw new APIError('An unexpected error occurred');
}