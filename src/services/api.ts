const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  verify: async () => {
    return await apiRequest('/auth/verify');
  },

  logout: () => {
    setAuthToken(null);
  },
};

// Students API
export const studentsAPI = {
  getAll: async () => await apiRequest('/students'),
  getById: async (id: string) => await apiRequest(`/students/${id}`),
  create: async (student: any) => await apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  }),
  update: async (id: string, student: any) => await apiRequest(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  }),
  delete: async (id: string) => await apiRequest(`/students/${id}`, {
    method: 'DELETE',
  }),
};

// Teachers API
export const teachersAPI = {
  getAll: async () => await apiRequest('/teachers'),
  create: async (teacher: any) => await apiRequest('/teachers', {
    method: 'POST',
    body: JSON.stringify(teacher),
  }),
  update: async (id: string, teacher: any) => await apiRequest(`/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(teacher),
  }),
  delete: async (id: string) => await apiRequest(`/teachers/${id}`, {
    method: 'DELETE',
  }),
  addPerformanceNote: async (id: string, note: string) => await apiRequest(`/teachers/${id}/performance-notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  }),
};

// Payments API
export const paymentsAPI = {
  getAll: async (filters?: { month?: number; year?: number; studentId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.studentId) params.append('studentId', filters.studentId);
    
    const endpoint = params.toString() ? `/payments?${params}` : '/payments';
    return await apiRequest(endpoint);
  },
  create: async (payment: any) => await apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(payment),
  }),
  update: async (id: string, payment: any) => await apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payment),
  }),
  delete: async (id: string) => await apiRequest(`/payments/${id}`, {
    method: 'DELETE',
  }),
};

// Groups API
export const groupsAPI = {
  getAll: async () => await apiRequest('/groups'),
  create: async (group: any) => await apiRequest('/groups', {
    method: 'POST',
    body: JSON.stringify(group),
  }),
  update: async (id: string, group: any) => await apiRequest(`/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(group),
  }),
  delete: async (id: string) => await apiRequest(`/groups/${id}`, {
    method: 'DELETE',
  }),
};

// Attendance API
export const attendanceAPI = {
  getAll: async (filters?: { month?: number; year?: number; groupId?: string; teacherId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    
    const endpoint = params.toString() ? `/attendance?${params}` : '/attendance';
    return await apiRequest(endpoint);
  },
  bulkSave: async (records: any[]) => await apiRequest('/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify({ records }),
  }),
  getStats: async (filters?: { groupId?: string; teacherId?: string; month?: number; year?: number }) => {
    const params = new URLSearchParams();
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.year) params.append('year', filters.year.toString());
    
    const endpoint = params.toString() ? `/attendance/stats?${params}` : '/attendance/stats';
    return await apiRequest(endpoint);
  },
};

// AI API
export const aiAPI = {
  getDashboardAnalysis: async () => await apiRequest('/ai/dashboard-analysis', {
    method: 'POST',
  }),
  askAssistant: async (query: string) => await apiRequest('/ai/assistant', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
  generateContent: async (topic: string, contentType: 'marketing' | 'quiz') => await apiRequest('/ai/generate-content', {
    method: 'POST',
    body: JSON.stringify({ topic, contentType }),
  }),
  analyzeStudentRisk: async (studentId: string) => await apiRequest('/ai/student-risk-analysis', {
    method: 'POST',
    body: JSON.stringify({ studentId }),
  }),
};

// Upload API
export const uploadAPI = {
  uploadReceipt: async (paymentId: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);

    return await fetch(`${API_BASE_URL}/uploads/receipt/${paymentId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  uploadReport: async (title: string, description: string, uploadedBy: string, uploadedByName: string, file: File) => {
    const formData = new FormData();
    formData.append('report', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('uploadedBy', uploadedBy);
    formData.append('uploadedByName', uploadedByName);

    return await fetch(`${API_BASE_URL}/uploads/report`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  downloadFile: async (type: string, filename: string) => {
    const response = await fetch(`${API_BASE_URL}/uploads/download/${type}/${filename}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download file');
    }
    
    return response.blob();
  },
};