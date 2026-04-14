export interface JwtPayload {
  role: string;
  user_id: string;
  session_id: string;
  version: number;
  is_keyholder: boolean;
  email?: string;
}
