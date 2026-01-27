import request from '@/lib/request';

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  creator?: string;
  created_at?: string;
  updated_at?: string;
  table_name?: string;
  columns?: any[];
}

export const datasetService = {
  /**
   * 获取数据集列表
   */
  getDatasets: () => request.get<Dataset[]>('/api/dataset/'),
  
  /**
   * 根据 ID 获取数据集详情
   */
  getDataset: (id: string) => request.get<Dataset>(`/api/dataset/${id}`),
};
