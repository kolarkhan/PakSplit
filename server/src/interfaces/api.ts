export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtUserPayload {
  userId: string;
  email: string;
}

