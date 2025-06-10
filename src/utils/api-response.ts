class ApiResponse<T> {
  statusCode: number;
  status: boolean;
  message: string;
  data: T | null;

  constructor(
    statusCode: number,
    status: boolean,
    message: string,
    data: T | null
  ) {
    this.statusCode = statusCode;
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
