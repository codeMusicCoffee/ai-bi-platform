'use client';

import { cn } from '@/lib/utils';
import axios from 'axios';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
  value?: string;
  onChange?: (url: string) => void;
  uploadApi?: string;
  defaultImage?: string;
  defaultIcon?: React.ReactNode;
  readonly?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  // 新实现 将 uploadApi = 'http://192.168.151.246:8000/api/upload' 改为使用 NEXT_PUBLIC_BACKEND_URL
  uploadApi = `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/upload`,
  defaultImage,
  defaultIcon,
  readonly = false,
  className,
}) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullUrl = (urlPath: string | undefined): string => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http') || urlPath.startsWith('data:')) return urlPath;

    const baseUrl =
      process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_API_BASE_URL || '' : '';

    const normalizedPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    return `${baseUrl}${normalizedPath}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(uploadApi, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      // Assuming the API returns the URL directly or in a field called 'url' or 'data.url'
      // We will try to find a string that looks like a URL in the response
      let url = '';
      if (typeof response.data === 'string') {
        url = response.data;
      } else if (response.data?.url) {
        url = response.data.url;
      } else if (response.data?.data?.url) {
        url = response.data.data.url;
      } else if (response.data?.path) {
        url = response.data.path;
      }

      if (url) {
        onChange?.(url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // You might want to show a toast message here
    } finally {
      setLoading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-[140px] h-[100px] border border-dashed border-gray-300 bg-slate-50 rounded-md overflow-hidden group transition-all',
        !readonly && 'cursor-pointer hover:border-blue-400',
        value && 'border-solid border-gray-200 bg-white',
        className
      )}
      onClick={() => !loading && !value && !readonly && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Empty State / Default Image / Default Icon */}
      {!value && !loading && (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          {readonly && defaultImage ? (
            <img
              src={defaultImage}
              alt="Default"
              className="w-full h-full object-cover opacity-60"
            />
          ) : readonly && defaultIcon ? (
            <div className="text-gray-300">{defaultIcon}</div>
          ) : (
            <>
              <Plus className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400">上传照片</span>
            </>
          )}
        </div>
      )}

      {/* Uploading State */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="relative flex items-center justify-center">
            {/* Circular Progress */}
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                className="text-white/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 * (1 - progress / 100)}
                className="text-white transition-all duration-300"
              />
            </svg>
            <span className="absolute text-[10px] font-medium text-white">{progress}%</span>
          </div>
        </div>
      )}

      {/* Uploaded View */}
      {value && (
        <div className="w-full h-full relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getFullUrl(value)} alt="Uploaded" className="w-full h-full object-cover" />

          {/* Hover Overlay */}
          {!loading && !readonly && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center justify-center w-8 h-8 bg-[#F56C6C] rounded-full text-white hover:bg-red-500 transition-colors shadow-sm"
                title="重传"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center justify-center w-8 h-8 text-white hover:text-gray-200 transition-colors"
                title="删除"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
