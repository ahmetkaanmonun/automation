export enum AppRole {
  Admin = 'ADMIN',
  Tester = 'TESTER',
  Viewer = 'VIEWER',
}

export type JwtUser = {
  id: string;
  email: string;
  role: AppRole;
};

