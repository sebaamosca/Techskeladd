/** Typed shape of every error response returned by the GlobalExceptionFilter. */
export interface ErrorResponseDto {
  statusCode: number;
  message: string;
  correlationId: string;
  timestamp: string;
}
