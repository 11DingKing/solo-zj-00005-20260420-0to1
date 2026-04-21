const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('chat_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || '请求失败');
  }
  
  return data;
}

export const authAPI = {
  register: (username: string, password: string, nickname?: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname })
    }),
    
  login: (username: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),
    
  getMe: () => request('/auth/me')
};

export const roomsAPI = {
  getAll: () => request<any>('/rooms'),
  
  create: (name: string, description: string, maxUsers: number) =>
    request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, description, maxUsers })
    }),
    
  getById: (roomId: string) => request<any>(`/rooms/${roomId}`),
  
  getMessages: (roomId: string, before?: string, limit: number = 50) => {
    const params = new URLSearchParams();
    if (before) params.set('before', before);
    params.set('limit', limit.toString());
    return request<any>(`/rooms/${roomId}/messages?${params.toString()}`);
  },
  
  getOnlineUsers: (roomId: string) => request<any>(`/rooms/${roomId}/users`)
};

export { API_URL };
