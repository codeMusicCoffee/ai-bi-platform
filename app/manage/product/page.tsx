'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import React from 'react';
import { CategoryTree } from './CategoryTree';

export default function ProductManagePage() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* 侧边栏作为页面内容的一部分 */}
      <CategoryTree />

      {/* 右侧业务内容区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Brand Information Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-[3px] h-4 bg-[#306EFD]" />
              <CardTitle className="text-lg font-bold">品牌信息</CardTitle>
            </div>
            <div className="space-x-2">
              <Button variant="outline" className="h-8 border-gray-300">
                取消
              </Button>
              <Button className="h-8">确定</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
              <FormField label="品类" required>
                <Input placeholder="请输入品类" className="h-8" />
              </FormField>
              <FormField label="系列" required>
                <Input placeholder="请输入系列" className="h-8" />
              </FormField>
              <FormField label="品牌" required>
                <Input placeholder="请输入品牌" className="h-8" />
              </FormField>
              <FormField label="香型" required>
                <Select>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="请选择香型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nongxiang">浓香型</SelectItem>
                    <SelectItem value="jiangxiang">酱香型</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="配方" required>
                <Input placeholder="请输入配方" className="h-8" />
              </FormField>
              <FormField label="功效" required>
                <Input placeholder="请输入" className="h-8" />
              </FormField>
              <FormField label="功效成分" required>
                <Input placeholder="请输入" className="h-8" />
              </FormField>
              <FormField label="上市时间">
                <Input type="date" className="h-8 block" />
              </FormField>
              <FormField label="价格带">
                <Input placeholder="请输入价格带" className="h-8" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="适饮人群">
                <Textarea placeholder="请输入" className="min-h-[100px] resize-none" />
              </FormField>
              <FormField label="饮用方法">
                <Textarea placeholder="请输入" className="min-h-[100px] resize-none" />
              </FormField>
              <FormField label="口碑现状">
                <Textarea placeholder="请输入" className="min-h-[100px] resize-none" />
              </FormField>
              <FormField label="品评">
                <Textarea placeholder="请输入" className="min-h-[100px] resize-none" />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Product List Card */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-[3px] h-4 bg-[#306EFD]" />
              <CardTitle className="text-lg font-bold">产品列表</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button className="h-8">
                <Plus className="mr-2 h-4 w-4" /> 新增
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>酒度 (%vol)</TableHead>
                    <TableHead>容量 (ml)</TableHead>
                    <TableHead>上市时间</TableHead>
                    <TableHead>产品价格 (元/瓶)</TableHead>
                    <TableHead>包装形式</TableHead>
                    <TableHead>主要渠道</TableHead>
                    <TableHead>当前阶段</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>125ml-35度-中国劲酒</TableCell>
                      <TableCell>35</TableCell>
                      <TableCell>125</TableCell>
                      <TableCell>2020-12-21</TableCell>
                      <TableCell>68</TableCell>
                      <TableCell>光瓶</TableCell>
                      <TableCell>商超、烟酒、餐饮店</TableCell>
                      <TableCell>运营</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="link" className="text-blue-500 h-auto p-0">
                            查看
                          </Button>
                          <Button variant="link" className="text-red-500 h-auto p-0">
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <Label className="text-gray-700 font-medium text-[13px] leading-[20px]">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}：
      </Label>
      {children}
    </div>
  );
}
