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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit2, Package, Plus, Trash2 } from 'lucide-react';
import React from 'react';

export function ProductDetailView({ productName }: { productName: string }) {
  return (
    <div className="space-y-6">
      {/* Header with Title and Tabs */}
      <div className="bg-white px-6 pt-6 pb-0 rounded-[12px] shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{productName}</h2>
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger
              value="base"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#306EFD] data-[state=active]:text-[#306EFD] data-[state=active]:shadow-none font-medium transition-all"
            >
              基础信息管理
            </TabsTrigger>
            <TabsTrigger
              value="lifecycle"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#306EFD] data-[state=active]:text-[#306EFD] data-[state=active]:shadow-none font-medium transition-all text-gray-500 hover:text-gray-700"
            >
              生命周期管理
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#306EFD] data-[state=active]:text-[#306EFD] data-[state=active]:shadow-none font-medium transition-all text-gray-500 hover:text-gray-700"
            >
              看板管理
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Product Info Card */}
      <Card className="border-none shadow-sm rounded-[12px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <CardTitle className="text-lg font-bold text-gray-800">产品信息</CardTitle>
          </div>
          <div className="space-x-3">
            <Button
              variant="outline"
              className="h-8 border-gray-200 text-gray-600 rounded-[6px] px-4"
            >
              取消
            </Button>
            <Button className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px] px-6 shadow-sm shadow-blue-100">
              确定
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Image Placeholder */}
            <div className="w-full lg:w-48 h-56 bg-gradient-to-b from-gray-50 to-white rounded-xl flex flex-col items-center justify-center border border-gray-100 shrink-0 shadow-inner group overflow-hidden">
              <div className="text-gray-200 group-hover:text-blue-200 transition-colors duration-500">
                <Package size={64} strokeWidth={1} />
              </div>
              <span className="text-[11px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                Product Photo
              </span>
            </div>

            {/* Form Fields Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <FormField label="酒度" required>
                <Input placeholder="请输入酒度" className="h-9 border-gray-200" />
              </FormField>
              <FormField label="容量 (ml)" required>
                <Input placeholder="请输入容量" className="h-9 border-gray-200" />
              </FormField>
              <FormField label="产品价格">
                <Input placeholder="请输入产品价格" className="h-9 border-gray-200" />
              </FormField>
              <FormField label="包装形式">
                <Input placeholder="请输入包装形式" className="h-9 border-gray-200" />
              </FormField>
              <FormField label="主要渠道">
                <Select>
                  <SelectTrigger className="h-9 border-gray-200">
                    <SelectValue placeholder="请选择渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">商超</SelectItem>
                    <SelectItem value="online">电商</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="产品技术责任人" required>
                <Select>
                  <SelectTrigger className="h-9 border-gray-200">
                    <SelectValue placeholder="请选择责任人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">责任人A</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="产品研发责任人" required>
                <Select>
                  <SelectTrigger className="h-9 border-gray-200">
                    <SelectValue placeholder="请选择责任人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user2">责任人B</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="包装开发责任人" required>
                <Select>
                  <SelectTrigger className="h-9 border-gray-200">
                    <SelectValue placeholder="请选择责任人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user3">责任人C</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="退市时间">
                <Input type="date" className="h-9 border-gray-200" />
              </FormField>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Section */}
      <Card className="border-none shadow-sm rounded-[12px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <CardTitle className="text-lg font-bold text-gray-800">产品大事记</CardTitle>
          </div>
          <Button className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px]">
            <Plus className="mr-2 h-4 w-4" /> 新增
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 pl-4 relative before:absolute before:left-[21px] before:top-2 before:bottom-6 before:w-[1px] before:bg-blue-100">
            {[
              { type: '试销', date: '2022-12-20', label: '大事纪标题', color: 'orange' },
              { type: '研发', date: '2022-12-20', label: '大事纪标题', color: 'blue' },
              { type: '研发', date: '2022-12-20', label: '大事纪标题', color: 'blue' },
            ].map((item, idx) => (
              <div key={idx} className="relative pb-8 group last:pb-2">
                <div className="absolute left-[2px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white z-10" />
                <div className="ml-8 bg-gray-50/50 hover:bg-gray-50 p-4 rounded-lg border border-transparent hover:border-blue-100 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.color === 'orange'
                            ? 'bg-orange-50 text-orange-500'
                            : 'bg-blue-50 text-blue-500'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-gray-400 text-[13px]">{item.date}</span>
                      <span className="text-gray-700 font-bold text-[14px]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-blue-500 flex items-center gap-1 text-[13px] hover:underline">
                        <Edit2 size={12} /> 编辑
                      </button>
                      <button className="text-red-500 flex items-center gap-1 text-[13px] hover:underline">
                        <Trash2 size={12} /> 删除
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    大事记内容大事记内容大事记内容大事记内容大事记内容大事记内容大事记内容大事记内容大事记内容大事记内容大事记内容
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
      <Label className="text-gray-600 font-medium text-[13px]">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}：
      </Label>
      {children}
    </div>
  );
}
