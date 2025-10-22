export interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  nickname?: string; // Added for UI, might not be directly from API
  profileImage?: string; // Added for UI, might not be directly from API
}

export interface UserUpdate {
  email?: string;
  nickname?: string; // Added for UI, might not be directly from API
  profileImage?: string; // Added for UI, might not be directly from API
  is_active?: boolean;
  is_superuser?: boolean;
  is_verified?: boolean;
}

export interface UserPasswordUpdate {
  password: string;
}
