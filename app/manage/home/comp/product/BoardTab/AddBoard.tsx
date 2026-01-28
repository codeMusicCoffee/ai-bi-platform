'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface AddBoardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
}

export function AddBoard({ open, onOpenChange, productId }: AddBoardProps) {
  const [styleDesc, setStyleDesc] = useState('');
  const [otherDesc, setOtherDesc] = useState('');

  const handleConfirm = () => {
    // Logic for generating board
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] p-0 overflow-hidden border-none rounded-[12px]">
        <DialogHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-gray-100">
          <DialogTitle className="text-[16px] font-bold text-gray-800">生成看板</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[14px] font-medium text-gray-800">风格描述：</label>
            <Textarea
              value={styleDesc}
              onChange={(e) => setStyleDesc(e.target.value)}
              placeholder="请输入"
              className="min-h-[120px] resize-none border-gray-200 focus:border-primary text-[14px]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[14px] font-medium text-gray-800">其他描述：</label>
            <Textarea
              value={otherDesc}
              onChange={(e) => setOtherDesc(e.target.value)}
              placeholder="请输入"
              className="min-h-[120px] resize-none border-gray-200 focus:border-primary text-[14px]"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#F8F9FB] gap-3">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="ghost"
            className="bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            取消
          </Button>
          <Button onClick={handleConfirm} className="text-white shadow-none">
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
