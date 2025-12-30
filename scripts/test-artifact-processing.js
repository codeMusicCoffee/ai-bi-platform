// 测试 artifact 处理功能的脚本

const testArtifactMessages = [
  {
    type: 'artifact_code',
    content: 'import React from "react";\n'
  },
  {
    type: 'artifact_code', 
    content: 'import { BarChart, Bar, XAxis, YAxis } from "recharts";\n\n'
  },
  {
    type: 'artifact_code',
    content: 'export default function Dashboard() {\n'
  },
  {
    type: 'artifact_code',
    content: '  const data = [{ name: "A", value: 100 }];\n'
  },
  {
    type: 'artifact_code',
    content: '  return (\n    <div className="p-4">\n'
  },
  {
    type: 'artifact_code',
    content: '      <BarChart width={400} height={300} data={data}>\n'
  },
  {
    type: 'artifact_code',
    content: '        <XAxis dataKey="name" />\n        <YAxis />\n'
  },
  {
    type: 'artifact_code',
    content: '        <Bar dataKey="value" fill="#8884d8" />\n'
  },
  {
    type: 'artifact_code',
    content: '      </BarChart>\n    </div>\n  );\n}'
  },
  {
    type: 'artifact_end'
  }
];

console.log('🧪 测试 Artifact 处理功能');
console.log('📋 模拟消息序列:');

let buffer = '';
let isCollecting = false;

testArtifactMessages.forEach((msg, index) => {
  console.log(`\n${index + 1}. 处理消息:`, msg);
  
  if (msg.type === 'artifact_code') {
    console.log('   🎨 检测到 artifact_code 类型');
    isCollecting = true;
    buffer += msg.content;
    console.log(`   📝 累积代码长度: ${buffer.length} 字符`);
  } else if (msg.type === 'artifact_end') {
    console.log('   🏁 检测到 artifact_end，代码收集完成');
    isCollecting = false;
    console.log('   ✅ 最终代码:');
    console.log('   ' + '='.repeat(50));
    console.log(buffer);
    console.log('   ' + '='.repeat(50));
  }
});

console.log('\n🎉 测试完成！');
console.log(`📊 最终统计: ${buffer.split('\n').length} 行代码，${buffer.length} 字符`);