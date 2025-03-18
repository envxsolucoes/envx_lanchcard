import axios from 'axios';

// Configuração do cliente Axios para comunicação com a API do backend
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  // Verifica se o código está rodando no navegador (não durante SSR do Next.js)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Tratamento de erro de autenticação (401)
    if (error.response?.status === 401) {
      console.error('Erro de autenticação:', error);
      
      // Se estiver no navegador, redireciona para login
      if (typeof window !== 'undefined') {
        // Se não estiver na página de login, redirecionar
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    
    // Tratamento de erros de servidor (500)
    if (error.response?.status >= 500) {
      console.error('Erro no servidor:', error);
    }
    
    return Promise.reject(error);
  }
);

// Tipos de dados para uso com TypeScript
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  available: boolean;
  nutritional_info?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_id?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

// Funções para comunicação com a API

// Autenticação
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

// Produtos
export const getProducts = async (categoryId?: number) => {
  const params = categoryId ? { category_id: categoryId } : {};
  const response = await api.get<Product[]>('/products', { params });
  return response.data;
};

export const getProduct = async (id: number) => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

// Categorias
export const getCategories = async () => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};

// Pedidos
export const createOrder = async (orderData: Partial<Order>) => {
  const response = await api.post<Order>('/orders', orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};

export const getOrder = async (id: number) => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: number, status: string) => {
  const response = await api.patch<Order>(`/orders/${id}/status`, { status });
  return response.data;
};

// Pagamentos
export const generatePayment = async (orderId: number, method: string) => {
  const response = await api.post(`/payments/generate`, { order_id: orderId, method });
  return response.data;
};

export const checkPaymentStatus = async (paymentId: string) => {
  const response = await api.get(`/payments/${paymentId}/status`);
  return response.data;
};

// Função utilidade para verificar se o backend está online
export const checkApiStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('API offline ou inacessível', error);
    return { status: 'offline' };
  }
};

export default api; 