export interface User {
  id: number;
  name: string; // Added based on login API response
  email: string;
  is_active?: boolean; // Made optional
  is_superuser?: boolean; // Made optional
  is_verified?: boolean; // Made optional
  nickname?: string;
  profileImage?: string;
}

export interface UserUpdate {
  email?: string;
  nickname?: string;
  profileImage?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface UserPasswordUpdate {
  password: string;
}
