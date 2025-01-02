export class AuthError extends Error {
    constructor(
      message: string,
      public code: string,
      public status: number = 401
    ) {
      super(message);
      this.name = 'AuthError';
    }
  }
  
  export class ValidationError extends Error {
    constructor(
      message: string,
      public errors: Array<{ field: string; message: string }>,
      public status: number = 400
    ) {
      super(message);
      this.name = 'ValidationError';
    }
  }