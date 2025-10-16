export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    access_expires_in: number;
    refresh_expires_in: number;
    user_id: number;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface UserSettings {
    title: string;
  }