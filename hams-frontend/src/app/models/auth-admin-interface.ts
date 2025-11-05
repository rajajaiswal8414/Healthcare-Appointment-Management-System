export interface Admin {
  adminId: number;
  username: string;
  role: string;
}

export interface AuthAdminLogin {
  username: string;
  password: string;
}

export interface AuthAdminResponse {
  token: string;
  type: 'Bearer';
  admin: Admin;
}
