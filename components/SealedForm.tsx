'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FieldValues, Path, useForm, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';

/**
 * 密封表单项配置接口
 */
export interface SealedFormFieldConfig<T extends FieldValues> {
  /** 字段映射名称 */
  name: Path<T>;
  /** 标签文本 */
  label: string;
  /** 提示文本 */
  placeholder?: string;
  /** 输入框类型 */
  type?: string;
  /** 是否必填（显示红星） */
  required?: boolean;
  /** 自定义渲染组件 */
  render?: (field: any) => React.ReactNode;
}

interface SealedFormProps<T extends FieldValues> {
  /** Zod 校验 Schema */
  schema: z.ZodSchema<T>;
  /** 提交回调 */
  onSubmit: (data: T) => void;
  /** 字段配置数组 */
  fields: SealedFormFieldConfig<T>[];
  /** 默认值 */
  defaultValues?: Partial<T>;
  /** 子元素，支持函数式渲染以获取 form 实例 */
  children?: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode);
  /** 表单容器类名 */
  className?: string;
  /** 表单项容器类名 */
  fieldClassName?: string;
}

/**
 * SealedForm - 基于 shadcn/ui 封装的高级表单组件
 * 支持双向绑定、自动校验、布局锁定（防止错误提示导致高度跳动）
 */
export function SealedForm<T extends FieldValues>({
  schema,
  onSubmit,
  fields,
  defaultValues,
  children,
  className,
  fieldClassName,
}: SealedFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onTouched', // 首次失焦或改变时触发校验
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
        {fields.map((config) => (
          <FormField
            key={config.name as string}
            control={form.control}
            name={config.name}
            render={({ field }) => (
              <FormItem className={cn('space-y-1.5', fieldClassName)}>
                <FormLabel className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700">
                  {config.label}
                  {config.required && <span className="text-red-500 font-bold">*</span>}
                </FormLabel>
                <FormControl>
                  {config.render ? (
                    config.render(field)
                  ) : (
                    <Input
                      placeholder={config.placeholder}
                      type={config.type}
                      className="h-10 border-gray-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-[6px]"
                      {...field}
                      // 确保受控组件的值不为 undefined 以支持双向绑定
                      value={field.value ?? ''}
                    />
                  )}
                </FormControl>
                {/* 锁定高度的错误信息容器，防止布局抖动 */}
                <div className="h-5 flex items-center">
                  <FormMessage className="text-[12px] text-red-500 leading-none" />
                </div>
              </FormItem>
            )}
          />
        ))}
        <div className="pt-2">{typeof children === 'function' ? children(form) : children}</div>
      </form>
    </Form>
  );
}
