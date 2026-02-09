// backend-nest/src/datasets/datasets.types.ts - Dataset DTO definitions
export type ColumnSchema = {
  name: string;
  type: string;
  description: string;
};

export type DatasetMeta = {
  id: string;
  name: string;
  description: string;
  type: string;
  source: string;
  row_count: number;
  column_count: number;
  columns: ColumnSchema[];
  update_frequency: string;
  last_updated: string;
  created_at: string;
  tags: string[];
};

export type DatasetListItem = {
  id: string;
  name: string;
  description: string;
  type: string;
  source: string;
  row_count: number;
  column_count: number;
  update_frequency: string;
  last_updated: string;
  tags: string[];
};

export type DatasetListResponse = {
  total: number;
  items: DatasetListItem[];
};

export type DatasetPreview = {
  meta: DatasetMeta;
  sample_data: Record<string, unknown>[];
  sample_row_count: number;
};

export type DatasetColumnsResponse = {
  dataset_id: string;
  dataset_name: string;
  columns: ColumnSchema[];
};

export type DatasetStatsResponse = {
  dataset_id: string;
  dataset_name: string;
  row_count: number;
  column_count: number;
  null_percentage: number;
  duplicate_percentage: number;
  data_quality_score: number;
  storage_size_mb: number;
  last_validated: string;
};

export type DatasetDataResponse = {
  dataset_id: string;
  name: string;
  data: Record<string, unknown>[];
  row_count: number;
  type: string;
};

