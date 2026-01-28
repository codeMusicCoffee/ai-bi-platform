import request from '@/lib/request';

export interface Category {
  id: string;
  name: string;
}

export interface Series {
  id: string;
  category_id: string;
  name: string;
}

export interface Brand {
  id: string;
  category_id: string;
  series_id: string;
  name: string;
  aroma_type?: string;
  efficacy?: string;
  launch_date?: string;
  price_range?: string;
  drinking_method?: string;
  efficacy_ingredients?: string;
  reputation_statement?: string;
  target_audience?: string;
  tasting_notes?: string;
}

export interface ProductNode {
  id: string;
  label: string;
  type: 'category' | 'series' | 'brand' | 'product';
  children?: ProductNode[];
}

export const pmService = {
  // Tree
  getTree: () => request.get<any>('/api/pm/tree'),

  // Categories
  createCategory: (data: { name: string }) => 
    request.post<Category>('/api/pm/categories', data, { showSuccessMsg: true }),
  updateCategory: (id: string, data: { name: string }) => 
    request.put<Category>(`/api/pm/categories/${id}`, data, { showSuccessMsg: true }),
  deleteCategory: (id: string) => 
    request.delete(`/api/pm/categories/${id}`, {}, { showSuccessMsg: true }),

  // Series
  createSeries: (data: { category_id: string; name: string }) => 
    request.post<Series>('/api/pm/series', data, { showSuccessMsg: true }),
  updateSeries: (id: string, data: { category_id?: string; name?: string }) => 
    request.put<Series>(`/api/pm/series/${id}`, data, { showSuccessMsg: true }),
  deleteSeries: (id: string) => 
    request.delete(`/api/pm/series/${id}`, {}, { showSuccessMsg: true }),

  // Brands
  createBrand: (data: Partial<Brand> & { category_id: string; series_id: string; name: string }) => 
    request.post<Brand>('/api/pm/brands', data, { showSuccessMsg: true }),
  updateBrand: (id: string, data: Partial<Brand>) => 
    request.put<Brand>(`/api/pm/brands/${id}`, data, { showSuccessMsg: true }),
  getBrand: (id: string) => 
    request.get<Brand>(`/api/pm/brands/${id}`),
  getProducts: (brandId: string) => 
    request.get<{ items: any[]; total: number }>(`/api/pm/brands/${brandId}/products`),
  deleteBrand: (id: string) => 
    request.delete(`/api/pm/brands/${id}`, {}, { showSuccessMsg: true }),

  // Products
  createProduct: (data: { brand_id: string; name: string; image_url?: string }) =>
    request.post<any>('/api/pm/products', data, { showSuccessMsg: true }),
  getProduct: (id: string) =>
    request.get<any>(`/api/pm/products/${id}`),
  updateProduct: (id: string, data: { name?: string; image_url?: string } & any) =>
    request.put<any>(`/api/pm/products/${id}`, data, { showSuccessMsg: true }),
  deleteProduct: (id: string) =>
    request.delete(`/api/pm/products/${id}`, {}, { showSuccessMsg: true }),
  setProductCurrentStage: (productId: string, currentStageId: string) =>
    request.put<any>(`/api/pm/products/${productId}/current-stage`, { lifecycle_id: currentStageId }, { showSuccessMsg: true }),

  // Lifecycles
  getLifecycles: (productId: string) =>
    request.get<any[]>(`/api/pm/lifecycles`, { product_id: productId }),
  createLifecycle: (data: { product_id: string; name: string; description?: string; dataset_id?: string }) =>
    request.post<string>('/api/pm/lifecycles', data),
  updateLifecycle: (id: string, data: { name?: string; description?: string; dataset_id?: string }) =>
    request.put<string>(`/api/pm/lifecycles/${id}`, data, { showSuccessMsg: true }),
  deleteLifecycle: (id: string) =>
    request.delete(`/api/pm/lifecycles/${id}`, {}, { showSuccessMsg: true }),
  reorderLifecycles: (data: {
    product_id: string;
    items: { lifecycle_id: string; sort_order: number }[];
  }) => request.put<any>('/api/pm/lifecycles/actions/reorder', data),
  getLifecycleKanbanTree: (productId: string) =>
    request.get<{ items: any[]; total: number }>('/api/pm/lifecycles/actions/kanban-tree', {
      product_id: productId,
    }),

  // Milestones
  getMilestones: (productId: string) =>
    request.get<any[]>(`/api/pm/milestones`, { product_id: productId }),
  createMilestone: (data: { product_id: string; title: string; lifecycle_id: string; date: string; content: string }) =>
    request.post<any>('/api/pm/milestones', data, { showSuccessMsg: true }),
  updateMilestone: (id: string, data: { title?: string; lifecycle_id?: string; date?: string; content?: string }) =>
    request.put<any>(`/api/pm/milestones/${id}`, data, { showSuccessMsg: true }),
  deleteMilestone: (id: string) =>
    request.delete(`/api/pm/milestones/${id}`, {}, { showSuccessMsg: true }),

  // Kanbans (看板配置)
  getBoards: (lifecycleId: string) =>
    request.get<any[]>(`/api/pm/kanbans/`, { lifecycle_id: lifecycleId }),
  createBoard: (data: {
    lifecycle_id: string;
    dataset_id: string;
    module_name: string;
    chart_style: string;
    description: string;
    dataset_fields: string[];
  }) => request.post<any>('/api/pm/kanbans/', data, { showSuccessMsg: true }),
  updateBoard: (
    id: string,
    data: {
      module_name?: string;
      chart_style?: string;
      description?: string;
      dataset_fields?: string[];
    }
  ) => request.put<any>(`/api/pm/kanbans/${id}`, data, { showSuccessMsg: true }),
  deleteBoard: (id: string) =>
    request.delete(`/api/pm/kanbans/${id}`, {}, { showSuccessMsg: true }),
};
