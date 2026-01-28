'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AlertDialogProps {
  /** 是否打开 */
  open: boolean;
  /** 打开状态改变回调 */
  onOpenChange: (open: boolean) => void;
  /** 确认回调 */
  onConfirm: () => Promise<void> | void;
  /** 弹窗标题，默认为“删除提示” */
  title?: string;
  /** 提示文案，默认为“确定删除吗？” */
  description?: string;
  /** 确认按钮文案，默认为“确定” */
  confirmText?: string;
  /** 取消按钮文案，默认为“取消” */
  cancelText?: string;
}

/**
 * 统一风格的删除确认弹窗
 */
export function AlertDialog({
  open,
  onOpenChange,
  onConfirm,
  title = '删除提示',
  description = '确定删除吗？',
  confirmText = '确定',
  cancelText = '取消',
}: AlertDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 border-none shadow-lg rounded-[12px] overflow-hidden">
        <DialogHeader className="p-4 border-b border-gray-50">
          <DialogTitle className="text-[15px] font-medium text-gray-800">{title}</DialogTitle>
        </DialogHeader>

        <div className="p-8 flex items-center gap-3">
          <div className="bg-[#fee2e2] rounded-full p-1.5 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-white fill-[#f05252]" />
          </div>
          <span className="text-[15px] text-gray-700 font-medium">{description}</span>
        </div>

        <DialogFooter className="p-4 pt-0 flex sm:justify-end gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 border-none rounded-[6px] h-9 px-4"
          >
            {cancelText}
          </Button>
          <Button
            className="bg-[#f05252] hover:bg-[#d94141] text-white border-none rounded-[6px] h-9 px-4 min-w-[64px]"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
