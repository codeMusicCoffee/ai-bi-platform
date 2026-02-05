import { z } from 'zod';

// ====================
// 生命周期节点
// ====================
export interface LifecycleNode {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

// ====================
// 看板数据
// ====================
export interface DashboardItem {
  id: string;
  dataset_id: string;
  dataset_name: string;
  module_name: string;
  chart_style: string;
  description: string;
  dataset_fields: string[];
}

// ====================
// 节点信息表单
// ====================
export const nodeInfoSchema = z.object({
  name: z.string().min(1, '请输入节点名称'),
  description: z.string().min(1, '请输入节点描述'),
});

export type NodeInfoValues = z.infer<typeof nodeInfoSchema>;

// ====================
// 组件 Props
// ====================
export interface SortableNodeProps {
  node: LifecycleNode;
  isActive: boolean;
  onNodeClick: (id: string) => void;
  onOpenDelete: (id: string) => void;
  onSetCurrent: (id: string) => void;
}

export interface NodeFlowAreaProps {
  nodes: LifecycleNode[];
  activeNodeId: string | null;
  onNodeClick: (id: string) => void;
  onOpenDelete: (id: string) => void;
  onSetCurrent: (id: string) => void;
  onCreate: (position: 'left' | 'right') => void;
  onReorder: (newNodes: LifecycleNode[]) => void;
}

export interface NodeInfoSectionProps {
  activeNode: LifecycleNode | undefined;
  isEditing: boolean;
  onEditToggle: (editing: boolean) => void;
  onSubmit: (values: NodeInfoValues) => Promise<void>;
}

export interface BoardConfigSectionProps {
  tableData: DashboardItem[];
  loading: boolean;
  selectedRowKeys: string[];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSelectionChange: (keys: string[]) => void;
  onAddBoard: () => void;
  onEditBoard: (board: DashboardItem) => void;
  onDeleteBoard: (id: string) => void;
  onGenerateBoard: () => void;
}
