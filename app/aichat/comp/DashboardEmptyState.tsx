// 暂时注释：组件内容已禁用，返回 null，让沙箱直接显示默认预览页面
// import { LayoutDashboard } from 'lucide-react';

export default function DashboardEmptyState() {
  // 新实现：暂时返回 null，不渲染任何内容
  return null;

  /* 原实现：保留以便后续恢复
  return (
    <div className="h-full w-full flex items-center justify-center bg-gray-50/50">
      <div className="text-center text-gray-400">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 flex items-center justify-center mx-auto mb-6 transition-transform hover:scale-105 duration-300">
          <LayoutDashboard className="w-10 h-10 opacity-30 text-indigo-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-600">准备就绪</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
          在左侧输入需求，AI 将为您编写并实时运行 React 代码
        </p>
      </div>
    </div>
  );
  */
}
