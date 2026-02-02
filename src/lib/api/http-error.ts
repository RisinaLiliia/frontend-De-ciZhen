// src/lib/api/http-error.ts
export type HttpErrorDto = {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  requestId?: string;
  stack?: string; 
};

export class ApiError extends Error {
  public status: number;
  public data?: HttpErrorDto;

  constructor(message: string, status: number, data?: HttpErrorDto) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
