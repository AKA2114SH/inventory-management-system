import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      // Get user info
      try {
        const userResponse = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${response.data.access_token}` }
        });
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      } catch (e) {
        console.error('Failed to get user info', e);
      }
    }
    
    return response.data;
  },
  
  async register(userData: { username: string; email: string; password: string; full_name?: string }): Promise<User> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },
  
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }
};

export default authService;
