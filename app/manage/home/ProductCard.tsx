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

export function ProductCard() {
  return (
    <>
      {/* Brand Information Card */}
      <Card className="border-none shadow-sm rounded-[12px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <CardTitle className="text-lg font-bold text-gray-800">品牌信息</CardTitle>
          </div>
          <div className="space-x-3">
            <Button
              variant="outline"
              className="h-8 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-[6px] px-4"
            >
              取消
            </Button>
            <Button className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px] px-6 shadow-sm shadow-blue-100">
              确定
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6">
            <FormField label="品类" required>
              <Input
                placeholder="请输入品类"
                className="h-9 border-gray-200 focus:border-blue-400 focus:ring-blue-50 transition-all"
              />
            </FormField>
            <FormField label="系列" required>
              <Input
                placeholder="请输入系列"
                className="h-9 border-gray-200 focus:border-blue-400 focus:ring-blue-50 transition-all"
              />
            </FormField>
            <FormField label="品牌" required>
              <Input
                placeholder="请输入品牌"
                className="h-9 border-gray-200 focus:border-blue-400 focus:ring-blue-50 transition-all"
              />
            </FormField>
            <FormField label="香型" required>
              <Select>
                <SelectTrigger className="h-9 border-gray-200">
                  <SelectValue placeholder="请选择香型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nongxiang">浓香型</SelectItem>
                  <SelectItem value="jiangxiang">酱香型</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="配方" required>
              <Input placeholder="请输入配方" className="h-9 border-gray-200" />
            </FormField>
            <FormField label="功效" required>
              <Input placeholder="请输入" className="h-9 border-gray-200" />
            </FormField>
            <FormField label="功效成分" required>
              <Input placeholder="请输入" className="h-9 border-gray-200" />
            </FormField>
            <FormField label="上市时间">
              <Input type="date" className="h-9 border-gray-200" />
            </FormField>
            <FormField label="价格带">
              <Input placeholder="请输入价格带" className="h-9 border-gray-200" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            <FormField label="适饮人群">
              <Textarea
                placeholder="请输入"
                className="min-h-[100px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-50"
              />
            </FormField>
            <FormField label="饮用方法">
              <Textarea
                placeholder="请输入"
                className="min-h-[100px] resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-50"
              />
            </FormField>
            <FormField label="口碑现状">
              <Textarea
                placeholder="请输入"
                className="min-h-[100px] resize-none border-gray-200"
              />
            </FormField>
            <FormField label="品评">
              <Textarea
                placeholder="请输入"
                className="min-h-[100px] resize-none border-gray-200"
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Product List Card */}
      <Card className="border-none shadow-sm rounded-[12px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100 mx-6 px-0 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-[3px] h-4 bg-[#306EFD] rounded-full" />
            <CardTitle className="text-lg font-bold text-gray-800">产品列表</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button className="h-8 bg-[#306EFD] hover:bg-[#285cd1] text-white rounded-[6px]">
              <Plus className="mr-2 h-4 w-4" /> 新增
            </Button>
          </div>

          <div className="border border-gray-100 rounded-[8px] overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="w-16 text-gray-500 font-semibold">序号</TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    产品名称
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    酒度 (%vol)
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    容量 (ml)
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    上市时间
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    产品价格 (元/瓶)
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    包装形式
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    主要渠道
                  </TableHead>
                  <TableHead className="text-gray-500 font-semibold text-center">
                    当前阶段
                  </TableHead>
                  <TableHead className="text-right text-gray-500 font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-gray-50/50 border-gray-100 transition-colors"
                  >
                    <TableCell className="text-gray-600 font-medium">{i + 1}</TableCell>
                    <TableCell className="text-gray-800 text-center">125ml-35度-中国劲酒</TableCell>
                    <TableCell className="text-gray-600 text-center">35</TableCell>
                    <TableCell className="text-gray-600 text-center">125</TableCell>
                    <TableCell className="text-gray-600 text-center">2020-12-21</TableCell>
                    <TableCell className="text-gray-600 text-center">68</TableCell>
                    <TableCell className="text-gray-600 text-center">光瓶</TableCell>
                    <TableCell className="text-gray-600 text-center">商超、烟酒、餐饮店</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#306EFD] text-[12px] rounded-full font-medium">
                        运营
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="link"
                          className="text-[#306EFD] h-auto p-0 font-medium hover:no-underline"
                        >
                          查看
                        </Button>
                        <Button
                          variant="link"
                          className="text-red-500 h-auto p-0 font-medium hover:no-underline hover:text-red-600"
                        >
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
    </>
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
