'use client';

import { useSandpack } from '@codesandbox/sandpack-react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

function safeString(v: unknown) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  // 不要 JSON.stringify 对象（可能包含 Window/iframe 引用）
  if (v instanceof Error) return v.message;
  return '[object]';
}

function normalizeStatus(status: unknown): string {
  return safeString(status).toLowerCase() || 'unknown';
}

function isReadyStatus(status: string) {
  return status.includes('idle') || status.includes('ready') || status.includes('done');
}

function isBootingStatus(status: string) {
  return (
    status.includes('init') ||
    status.includes('install') ||
    status.includes('compile') ||
    status.includes('loading') ||
    status.includes('start') ||
    status.includes('refresh')
  );
}

export default function SandpackBootOverlay({ minVisibleMs = 400 }: { minVisibleMs?: number }) {
  const { sandpack } = useSandpack();

  // 只读这两个“原始字段”，不要展开 sandpack 对象
  const rawStatus = (sandpack as any)?.status;
  const rawError = (sandpack as any)?.error;

  const status = normalizeStatus(rawStatus);

  const shouldShow = useMemo(() => {
    if (isReadyStatus(status)) return false;
    // unknown 时也展示，避免空白
    return isBootingStatus(status) || status === 'unknown';
  }, [status]);

  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldShow) {
      if (!visible) {
        shownAtRef.current = Date.now();
        setVisible(true);
      }
      return;
    }

    const shownAt = shownAtRef.current ?? Date.now();
    const elapsed = Date.now() - shownAt;
    const delay = Math.max(0, minVisibleMs - elapsed);

    const t = window.setTimeout(() => {
      setVisible(false);
      shownAtRef.current = null;
    }, delay);

    return () => window.clearTimeout(t);
  }, [shouldShow, visible, minVisibleMs]);

  if (!visible) return null;

  const errorMessage =
    rawError instanceof Error
      ? rawError.message
      : typeof rawError === 'string'
      ? rawError
      : rawError
      ? 'Sandbox error'
      : '';

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white">
      {errorMessage ? (
        <div className="max-w-md w-full px-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <div className="text-sm font-semibold text-gray-800 mb-1">Sandbox 运行出错</div>
          <div className="text-xs text-gray-500 break-words">{errorMessage}</div>
        </div>
      ) : (
        <>
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-gray-600">Sandbox 加载中…</p>
          <p className="mt-1 text-xs text-gray-400">
            状态：<span className="font-mono">{status}</span>
          </p>
        </>
      )}
    </div>
  );
}
