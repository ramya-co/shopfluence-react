// API configuration
export const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to make authenticated API calls
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('access_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, config);
  
  // Handle token expiration
  if (response.status === 401 && token) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // You might want to redirect to login page or refresh the page
    window.location.href = '/login';
  }
  
  return response;
};

// Specific API endpoints
export const api = {
  // Auth endpoints
  auth: {
    register: (data: any) => apiCall('/auth/register/', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => apiCall('/auth/login/', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiCall('/auth/logout/', { method: 'POST' }),
    profile: () => apiCall('/auth/profile/'),
    updateProfile: (data: any) => apiCall('/auth/profile/', { method: 'PUT', body: JSON.stringify(data) }),
    userInfo: () => apiCall('/auth/user-info/'),
  },
  
  // Cart endpoints
  cart: {
    get: () => apiCall('/cart/'),
    add: (data: any) => apiCall('/cart/add/', { method: 'POST', body: JSON.stringify(data) }),
    updateItem: (itemId: number, data: any) => 
      apiCall(`/cart/items/${itemId}/`, { method: 'PATCH', body: JSON.stringify(data) }),
    removeItem: (itemId: number) => apiCall(`/cart/items/${itemId}/remove/`, { method: 'DELETE' }),
    clear: () => apiCall('/cart/clear/', { method: 'DELETE' }),
  },
  
  // Wishlist endpoints
  wishlist: {
    get: () => apiCall('/wishlist/'),
    add: (data: any) => apiCall('/wishlist/add/', { method: 'POST', body: JSON.stringify(data) }),
    removeItem: (itemId: number) => apiCall(`/wishlist/items/${itemId}/remove/`, { method: 'DELETE' }),
    clear: () => apiCall('/wishlist/clear/', { method: 'DELETE' }),
    check: (productId: number) => apiCall(`/wishlist/check/${productId}/`),
    toggle: (productId: number) => apiCall(`/wishlist/toggle/${productId}/`, { method: 'POST' }),
  },
  
  // Product endpoints
  products: {
    list: (params?: string) => apiCall(`/products/${params ? `?${params}` : ''}`),
    get: (slug: string) => apiCall(`/products/${slug}/`),
    search: (query: string) => apiCall(`/products/search/?q=${encodeURIComponent(query)}`),
    featured: () => apiCall('/products/featured/'),
    newArrivals: () => apiCall('/products/new-arrivals/'),
    bestsellers: () => apiCall('/products/bestsellers/'),
  },
  
  // Orders endpoints
  orders: {
    list: () => apiCall('/orders/'),
    get: (id: number) => apiCall(`/orders/${id}/`),
    create: (data: any) => apiCall('/orders/create/', { method: 'POST', body: JSON.stringify(data) }),
    cancel: (id: number) => apiCall(`/orders/${id}/cancel/`, { method: 'POST' }),
  },
};
