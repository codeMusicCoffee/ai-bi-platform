// 暂时使用硬编码的看板代码，不调用真实模型
export const MOCK_DASHBOARD_CODE = `import React, { useState, useEffect } from 'react';

import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';

import { 
  LayoutDashboard, TrendingUp, Target, PieChart as PieIcon, 
  Calendar, Filter, Download, MoreHorizontal, RefreshCw,
  Award, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// --- 配置常量 (源自 JSON) ---
const THEME = {
  primary: "#2c3e50",
  secondary: "#3498db",
  accent: "#e74c3c",
  background: "#f8f9fa",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  success: "#10b981",
  warning: "#f59e0b"
};

// --- 模拟数据生成 (基于 JSON 描述) ---

// 1. 月度销售数据 (fp_total_sales)
const monthlySalesData = [
  { month: '1月', total_sales: 4200, profit: 2400 },
  { month: '2月', total_sales: 3800, profit: 2200 },
  { month: '3月', total_sales: 5100, profit: 2800 },
  { month: '4月', total_sales: 4800, profit: 2600 },
  { month: '5月', total_sales: 6200, profit: 3400 },
  { month: '6月', total_sales: 7400, profit: 3800 },
  { month: '7月', total_sales: 7100, profit: 3600 },
  { month: '8月', total_sales: 8500, profit: 4200 },
  { month: '9月', total_sales: 9100, profit: 4600 },
  { month: '10月', total_sales: 8800, profit: 4300 },
  { month: '11月', total_sales: 10500, profit: 5100 },
  { month: '12月', total_sales: 11200, profit: 5600 },
];

// 2. 区域销售对比 (fp_region_comparison)
const regionSalesData = [
  { region: '华东区', electronics: 4000, home: 2400, clothing: 2400 },
  { region: '华北区', electronics: 3000, home: 1398, clothing: 2210 },
  { region: '华南区', electronics: 2000, home: 9800, clothing: 2290 },
  { region: '西部区', electronics: 2780, home: 3908, clothing: 2000 },
  { region: '海外区', electronics: 1890, home: 4800, clothing: 2181 },
];

// 3. 产品销售构成 (fp_product_mix)
const productMixData = [
  { name: '电子产品', value: 4500 },
  { name: '家居用品', value: 3200 },
  { name: '服装服饰', value: 2800 },
  { name: '美妆个护', value: 1900 },
  { name: '食品饮料', value: 1500 },
];
const PIE_COLORS = ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#95a5a6'];

// 4. 目标 vs 实际 (fp_target_vs_actual)
const targetVsActualData = [
  { region: '华东区', actual: 12500, target: 11000 },
  { region: '华北区', actual: 9800, target: 10500 },
  { region: '华南区', actual: 15000, target: 13000 },
  { region: '西部区', actual: 8200, target: 9000 },
];

// --- 组件 ---

// 通用卡片容器
const Card = ({ title, subtitle, children, icon: Icon, className = "" }) => (
  <div className={\`bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col \${className}\`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {Icon && <Icon size={18} className="text-blue-500" />}
          {title}
        </h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <MoreHorizontal size={16} />
      </button>
    </div>
    <div className="flex-1 min-h-[250px] w-full">
      {children}
    </div>
  </div>
);

// 简易仪表盘组件 (Gauge)
const KPIGauge = ({ value, label }) => {
  // 根据阈值计算颜色: 80, 100, 120
  let color = THEME.accent; // < 80 Red
  if (value >= 80) color = THEME.warning; // 80-100 Yellow/Orange
  if (value >= 100) color = THEME.success; // > 100 Green
  if (value >= 120) color = THEME.secondary; // > 120 Blue

  // 构建半圆数据
  const data = [
    { name: 'Value', value: Math.min(value, 150) },
    { name: 'Remaining', value: 150 - Math.min(value, 150) },
  ];

  return (
    <div className="relative h-full flex flex-col items-center justify-center">
      <div className="h-[180px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* 中心数值 */}
        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-4xl font-bold" style={{ color: color }}>{value}%</span>
          <p className="text-xs text-gray-400 mt-1">达成率</p>
        </div>
      </div>
      <div className="text-center mt-[-20px]">
        <h4 className="font-medium text-gray-700">{label}</h4>
        <div className="flex gap-2 text-xs mt-2 justify-center">
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>&lt;80%</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>80-100%</span>
           <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div>&gt;100%</span>
        </div>
      </div>
    </div>
  );
};

export default function SalesDashboard() {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-10 font-sans text-gray-800">
      
      {/* --- 顶部导航栏 --- */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-[#2c3e50] p-2 rounded-lg">
                <LayoutDashboard className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2c3e50]">销售业绩监控中心</h1>
                <p className="text-xs text-gray-500">Sales Performance Monitoring Dashboard v1.2</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                <Calendar size={14} />
                {currentDate}
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="刷新数据">
                  <RefreshCw size={20} />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="筛选">
                  <Filter size={20} />
                </button>
                <button className="flex items-center gap-2 bg-[#2c3e50] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#34495e] transition-colors">
                  <Download size={16} />
                  导出报表
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- 核心 KPI 概览 (额外增强，不在JSON显式列表中但为BI标配) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: '本月总销售额', value: '¥112,000', change: '+12.5%', isUp: true },
            { label: '平均客单价', value: '¥245', change: '-2.1%', isUp: false },
            { label: '活跃客户数', value: '1,240', change: '+5.4%', isUp: true },
            { label: 'KPI 综合达成', value: '103%', change: '+8.2%', isUp: true },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-[#3498db]">
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <div className="flex justify-between items-end mt-2">
                <h3 className="text-2xl font-bold text-[#2c3e50]">{stat.value}</h3>
                <span className={\`flex items-center text-sm font-medium \${stat.isUp ? 'text-green-500' : 'text-red-500'}\`}>
                  {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* --- 主要图表区域 (基于 JSON grid_3x2) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1. 总销售额趋势 (fp_total_sales) - 占据 2 列 */}
          <Card 
            title="总销售额趋势" 
            subtitle="月度销售总额及环比变化趋势" 
            icon={TrendingUp}
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3498db" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => \`¥\${value}\`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [\`¥\${value}\`, '销售额']}
                />
                <Legend iconType="circle" />
                <Area 
                  type="monotone" 
                  dataKey="total_sales" 
                  name="总销售额" 
                  stroke="#3498db" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  name="毛利润" 
                  stroke="#2c3e50" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* 2. KPI 达成率 (fp_kpi_achievement) - 占据 1 列 */}
          <Card 
            title="区域 KPI 达成概览" 
            subtitle="当前季度全区平均达成情况" 
            icon={Award}
          >
            <KPIGauge value={103} label="全区平均达成率" />
          </Card>

          {/* 3. 区域销售对比 (fp_region_comparison) - 占据 1 列 */}
          <Card 
            title="区域销售对比" 
            subtitle="按产品类别分组" 
            icon={BarChart}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionSalesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="region" type="category" width={50} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{fill: '#f8f9fa'}} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="electronics" name="电子" stackId="a" fill="#2c3e50" radius={[0, 4, 4, 0]} />
                <Bar dataKey="home" name="家居" stackId="a" fill="#3498db" radius={[0, 4, 4, 0]} />
                <Bar dataKey="clothing" name="服饰" stackId="a" fill="#95a5a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* 4. 产品销售构成 (fp_product_mix) - 占据 1 列 */}
          <Card 
            title="产品销售构成" 
            subtitle="各产品线营收占比" 
            icon={PieIcon}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productMixData.map((entry, index) => (
                    <Cell key={\`cell-\${index}\`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => \`¥\${value}\`} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* 5. 目标 vs 实际 (fp_target_vs_actual) - 占据 1 列 */}
          <Card 
            title="目标 vs 实际" 
            subtitle="各区域业绩达标情况" 
            icon={Target}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={targetVsActualData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke="#f5f5f5" vertical={false} />
                <XAxis dataKey="region" scale="band" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 11}} tickFormatter={(val) => \`\${val/1000}k\`} />
                <Tooltip />
                <Legend wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="actual" name="实际完成" barSize={20} fill="#3498db" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="目标设定" barSize={10} fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

        </div>
      </div>

      {/* --- Footer Metadata --- */}
      <footer className="max-w-7xl mx-auto px-4 py-6 border-t border-gray-200 mt-8 text-center text-sm text-gray-400">
        <div className="flex justify-center gap-6">
          <span>Created By: analytics_team</span>
          <span>Last Updated: 2024-01-20</span>
          <span>Version: 1.2</span>
        </div>
        <div className="mt-2 flex justify-center gap-2">
           {["sales", "monitoring", "dashboard", "kpi"].map(tag => (
             <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-500">#{tag}</span>
           ))}
        </div>
      </footer>
    </div>
  );
}`;

export async function POST(req: Request) {
  try {
    // 暂时不调用真实模型，直接返回硬编码的看板代码
    // const { message } = await req.json();
    
    // TODO: 后续恢复真实 API 调用
    // const apiKey = process.env.GOOGLE_API_KEY;
    // if (!apiKey) {
    //   return Response.json({ error: "No API Key configured" }, { status: 500 });
    // }
    // const genAI = new GoogleGenerativeAI(apiKey);
    // const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n用户需求: ${message}`);
    // const response = await result.response;
    // let text = response.text();
    // text = text.replace(/^```(jsx|tsx|javascript|typescript|react)?\n?/, "").replace(/```$/, "");
    
    // 模拟延迟，提升用户体验
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return Response.json({ code: MOCK_DASHBOARD_CODE });
  } catch (error) {
    console.error("Generate Error:", error);
    return Response.json({ error: "Failed to generate code" }, { status: 500 });
  }
}
