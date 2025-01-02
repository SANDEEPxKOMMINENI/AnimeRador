export class StreamingError extends Error {
  constructor(
    message: string,
    public code: string = 'STREAMING_ERROR',
    public status: number = 503
  ) {
    super(message);
    this.name = 'StreamingError';
    Object.setPrototypeOf(this, StreamingError.prototype);
  }

  toJSON() {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      name: this.name,
    };
  }

  static isStreamingError(error: unknown): error is StreamingError {
    return error instanceof StreamingError;
  }
}