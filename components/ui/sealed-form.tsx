'use client';

import { DatePicker } from '@/components/ui/date-picker';
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
import { format, isValid } from 'date-fns';
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
  render?: (field: any, config: SealedFormFieldConfig<T>) => React.ReactNode;
  /** 额外的类名（用于布局调整，如 col-span-2） */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

interface SealedFormProps<T extends FieldValues> {
  /** Zod 校验 Schema */
  schema: z.ZodType<T, any, any>;
  /** 提交回调 */
  onSubmit: (data: T) => void;
  /** 字段配置数组 */
  fields: SealedFormFieldConfig<T>[];
  /** 默认值 */
  defaultValues?: Partial<T>;
  /** 只读模式 */
  readonly?: boolean;
  /** 子元素，支持函数式渲染以获取 form 实例及预渲染的 fields */
  children?:
    | React.ReactNode
    | ((props: { form: UseFormReturn<T>; fields: React.ReactNode }) => React.ReactNode);

  /** 表单容器类名 */
  className?: string;
  /** 网格布局容器类名，如果不传则不使用网格布局包裹 fields */
  gridClassName?: string;
  /** 表单项容器类名 */
  fieldClassName?: string;
}

/**
 * SealedForm - 基于 shadcn/ui 封装的高级表单组件
 * 支持双向绑定、自动校验、布局锁定、只读展示
 */
export function SealedForm<T extends FieldValues>({
  schema,
  onSubmit,
  fields,
  defaultValues,
  readonly = false,
  children,
  className,
  gridClassName,
  fieldClassName,
}: SealedFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as any,
    mode: 'onTouched',
  });

  // 当外部默认值变化时重置表单
  React.useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues as any);
    }
  }, [defaultValues, form]);

  const renderFields = () => {
    const nodes = fields.map((config) => (
      <FormField
        key={config.name as string}
        control={form.control}
        name={config.name}
        render={({ field }) => (
          <FormItem className={cn('space-y-1.5', config.className, fieldClassName)}>
            <FormLabel className="flex items-center gap-1 text-[13px] font-medium text-gray-500">
              {config.required && !readonly && <span className="text-red-500 font-bold">*</span>}
              {config.label}
              {readonly && '：'}
            </FormLabel>

            {readonly ? (
              <div
                className={cn(
                  'text-[14px] font-medium text-gray-800 wrap-break-word whitespace-pre-wrap',
                  config.className?.includes('col-span-2')
                    ? 'min-h-[100px] py-2'
                    : 'min-h-[32px] flex items-center'
                )}
              >
                {config.type === 'date' && field.value
                  ? isValid(new Date(field.value))
                    ? format(new Date(field.value), 'yyyy-MM-dd')
                    : field.value
                  : field.value || '-'}
              </div>
            ) : (
              <FormControl>
                {config.render ? (
                  config.render(field, config)
                ) : config.type === 'date' ? (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={config.disabled}
                    placeholder={config.placeholder}
                  />
                ) : (
                  <Input
                    placeholder={config.placeholder}
                    type={config.type}
                    disabled={config.disabled}
                    className="h-8 border-gray-200 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-[6px] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    {...field}
                    value={field.value ?? ''}
                  />
                )}
              </FormControl>
            )}

            <div className="h-2 flex items-center">
              {!readonly && <FormMessage className="text-[12px] text-red-500 leading-none" />}
            </div>
          </FormItem>
        )}
      />
    ));

    return gridClassName ? <div className={gridClassName}>{nodes}</div> : nodes;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className={cn('space-y-4', className)}>
        {typeof children === 'function' ? (
          children({ form, fields: renderFields() })
        ) : (
          <>
            {renderFields()}
            <div className="pt-2">{children}</div>
          </>
        )}
      </form>
    </Form>
  );
}
