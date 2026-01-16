'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Markdown } from '@/components/ai-elements/markdown';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputProvider,
  usePromptInputAttachments,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { InputGroupButton, InputGroupTextarea } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';
import { chatService } from '@/services/chat';
import { useChatStore } from '@/store/use-chat-store';
import { Loader2, Paperclip, Send, Sparkles } from 'lucide-react';
import { ComponentProps, useEffect, useRef, useState } from 'react';

// Message interface
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// 旧实现（保留，勿删）
// interface AiChatProps {
//   onCodeUpdate?: (code: string) => void;
//   onCodeEnd?: () => void;
//   onStatusChange?: (isLoading: boolean) => void;
//   isLoadingProps?: boolean;
// }

// 进度信息接口（导出供 DashboardPreview 使用）
export interface ProgressInfo {
  current: number;
  total: number;
  component?: string;
  stage?: string;
}

// 新实现：支持多文件 artifact 和进度信息
interface AiChatProps {
  onCodeUpdate?: (files: Record<string, string>) => void;
  onCodeEnd?: () => void;
  onStatusChange?: (isLoading: boolean) => void;
  onProgressUpdate?: (progress: ProgressInfo | null) => void;
  isLoadingProps?: boolean;
}

// Sub-component for the attachment button to access context
const AttachmentButton = () => {
  const { openFileDialog } = usePromptInputAttachments();
  return (
    <InputGroupButton onClick={openFileDialog} type="button" variant="ghost">
      <Paperclip className="w-4 h-4" />
    </InputGroupButton>
  );
};

// Sub-component to display attachments above the input
const AttachmentPreview = () => {
  const { files } = usePromptInputAttachments();
  if (files.length === 0) return null;

  return (
    <PromptInputAttachments className="pb-0">
      {(file) => <PromptInputAttachment key={file.id} data={file} />}
    </PromptInputAttachments>
  );
};

// Controlled Textarea component connected to PromptInputProvider
const PromptTextarea = (props: ComponentProps<typeof InputGroupTextarea>) => {
  const { textInput } = usePromptInputController();
  return (
    <InputGroupTextarea
      {...props}
      value={textInput.value}
      onChange={(e) => textInput.setInput(e.target.value)}
    />
  );
};

// Helper to convert dataURL to File
function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',');
  // Handle case where dataurl might be invalid or empty
  if (arr.length < 2) return null;

  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const FileAutoUploader = ({ onDatasetUploaded }: { onDatasetUploaded: (id: string) => void }) => {
  const { files } = usePromptInputAttachments();
  const { sessionId, setSessionId } = useChatStore();
  const uploadedFileIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handleUpload = async () => {
      // 旧实现（保留，勿删）
      // const backendUrl = 'http://192.168.110.29:8000';

      for (const filePart of files) {
        if (uploadedFileIds.current.has(filePart.id)) continue;
        if (!filePart.url) continue;

        uploadedFileIds.current.add(filePart.id);

        let file: File | null = null;
        if (filePart.url.startsWith('blob:')) {
          try {
            const response = await fetch(filePart.url);
            const blob = await response.blob();
            file = new File([blob], filePart.filename || 'file', { type: blob.type });
          } catch (error) {
            console.error('Error fetching blob:', error);
          }
        } else {
          file = dataURLtoFile(filePart.url, filePart.filename || 'file');
        }

        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          // Only append session_id if it exists
          if (sessionId) {
            formData.append('session_id', sessionId);
          }

          try {
            console.log('Auto uploading file:', file.name);

            const response = await chatService.uploadDataset(formData);
            if (!response.success) {
              console.error('File upload failed', response.message);
              uploadedFileIds.current.delete(filePart.id);
            } else {
              const data = response.data;
              console.log('File uploaded successfully', data);
              if (data.session_id && data.session_id !== sessionId) {
                setSessionId(data.session_id);
                console.log('Session ID set from upload:', data.session_id);
              }
              if (data.id) {
                onDatasetUploaded(data.id);
                console.log('Dataset ID set locally:', data.id);
              }
            }
          } catch (e) {
            console.error('File upload error', e);
            uploadedFileIds.current.delete(filePart.id);
          }
        }
      }
    };

    handleUpload();
  }, [files, sessionId, setSessionId, onDatasetUploaded]);

  return null;
};

// Sub-component to handle drag and drop for the entire chat area
const ChatDragDropArea = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { add } = usePromptInputAttachments();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      add(droppedFiles);
    }
  };

  return (
    <div
      className={cn('relative', className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDropCapture={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-50/90 border-2 border-indigo-500 border-dashed rounded-xl flex flex-col items-center justify-center pointer-events-none backdrop-blur-sm">
          <Paperclip className="w-8 h-8 text-indigo-500 mb-1 animate-bounce" />
          <p className="text-sm font-bold text-indigo-700">放入json,csv文件</p>
        </div>
      )}
      {children}
    </div>
  );
};

export default function AiChat({
  onCodeUpdate,
  onCodeEnd,
  onStatusChange,
  onProgressUpdate,
  isLoadingProps,
}: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const isSubmittingRef = useRef(false);
  const datasetIdRef = useRef<string | null>(null);

  // 新增：由于需要支持 Diff 更新，我们需要在本地保存一份完整的文件快照
  // 这样当后端只返回 Diff 时，我们可以基于这个快照进行 Patch
  const currentFilesRef = useRef<Record<string, string>>({});

  // 新增：更新本地文件快照的辅助函数
  const updateLocalFiles = (files: Record<string, string>) => {
    currentFilesRef.current = { ...currentFilesRef.current, ...files };
    // console.log('Local files snapshot updated:', Object.keys(currentFilesRef.current));
  };

  // Generate a unique ID
  const generateId = () => Math.random().toString(36).substring(7);

  const { sessionId, setSessionId } = useChatStore();

  // Load chat history when sessionId is available

  useEffect(() => {
    console.log('sessionId', sessionId);
    if (!sessionId) return;
    // 暂时注释获取session对话
    const fetchSession = async () => {
      try {
        // 仅设置本地 Loading，不触发父组件的 Generating 状态
        setIsLoading(true);
        const response = await chatService.getSession(sessionId);
        if (!response.success) {
          if (response.code === 404) {
            console.warn('Session not found, clearing local session');

            return;
          }
          throw new Error('Failed to fetch session');
        }

        const data = response.data;

        if (data.messages && Array.isArray(data.messages)) {
          const history: ChatMessage[] = data.messages.map((msg: any, index: number) => ({
            id: msg.id || `history-${index}-${Date.now()}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now(),
          }));
          setMessages(history);

          // ⚡️ 核心功能：恢复历史会话时，自动提取最后一条消息的代码并渲染
          // 要求：最后一条消息 -> artifacts 数组最后一条 -> code
          const lastMsg = data.messages[data.messages.length - 1];
          if (lastMsg && Array.isArray(lastMsg.artifacts) && lastMsg.artifacts.length > 0) {
            const lastArtifact = lastMsg.artifacts[lastMsg.artifacts.length - 1];
            // 只处理 react 类型的 artifact，且包含 code
            if (lastArtifact.type === 'react' && lastArtifact.code) {
              console.log('Restoring code from history artifact:', lastArtifact.title);

              // ⚡️ 关键修复：同步更新本地文件快照
              // 确保二次聊天返回 artifact_delta 时，能够正确合并已有文件
              if (typeof lastArtifact.code === 'object') {
                // 如果 code 是多文件对象，直接更新
                updateLocalFiles(lastArtifact.code);
              }

              if (onCodeUpdate) {
                // 兼容旧版 string 类型的 code
                const filesObj =
                  typeof lastArtifact.code === 'string'
                    ? { '/App.tsx': lastArtifact.code }
                    : lastArtifact.code;
                onCodeUpdate(filesObj);
              }
              if (onCodeEnd) {
                // 标记生成/流式传输结束，确保状态为"完成"
                onCodeEnd();
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const updateLoadingState = (loading: boolean) => {
    setIsLoading(loading);
    if (onStatusChange) {
      onStatusChange(loading);
    }
  };

  const handleSendMessage = async (input: { text: string; files: any[] }) => {
    const userText = input.text.trim();

    if ((!userText && input.files.length === 0) || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    updateLoadingState(true);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userText || (input.files.length > 0 ? `[Uploaded ${input.files.length} files]` : ''),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Ensure session ID exists
    let currentSessionId = sessionId;
    if (currentSessionId) {
      setSessionId(currentSessionId);
    }
    console.log('currentSessionId', currentSessionId);

    try {
      if (input.files.length > 0) {
        console.log('Sending message with files:', input.files.length);
      }

      // 新实现：本地直连后端避免代理缓存 SSE，生产环境使用相对路径
      const baseUrl =
        process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_BACKEND_URL : '';
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
          session_id: currentSessionId,
          dataset_id: datasetIdRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法获取响应流');

      const decoder = new TextDecoder();
      let buffer = '';
      let isFinished = false;
      let lastUpdateTime = 0;

      // Create a placeholder message for assistant
      const assistantMsgId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        },
      ]);

      // 旧实现（保留，勿删）
      // let accumulatedCode = '';
      // 新实现：支持多文件
      let accumulatedFiles: Record<string, string> = {};
      let accumulatedMessage = '';

      while (!isFinished) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const data = trimmedLine.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            // Helper to ensure think tag is closed when switching to other types
            const ensureThinkClosed = () => {
              if (
                accumulatedMessage.includes('<think>') &&
                !accumulatedMessage.includes('</think>')
              ) {
                accumulatedMessage += '</think>';
                // Update state immediately
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedMessage } : msg
                  )
                );
              }
            };

            if (parsed.type === 'session_id') {
              const newSessionId = parsed.content;
              if (newSessionId && newSessionId !== currentSessionId) {
                setSessionId(newSessionId);
                console.log('Session ID updated:', newSessionId);
              }
            } else if (parsed.type === 'artifact_start') {
              // 新增：处理 artifact_start，标记开始生成文件，关闭思考
              ensureThinkClosed();
              console.log('Artifact start:', parsed);
              // 不添加到消息中，只做状态处理
              // 旧实现（保留，勿删）：处理单文件 artifact_code
              // } else if (parsed.type === 'artifact_code') {
              //   ensureThinkClosed();
              //   const content = parsed.content || parsed.text || '';
              //   accumulatedCode += content;
              //   const now = Date.now();
              //   if (now - lastUpdateTime > 100) {
              //     if (onCodeUpdate) onCodeUpdate(accumulatedCode);
              //     lastUpdateTime = now;
              //   }
              // }

              // 新实现：处理多文件 artifact_file
            } else if (parsed.type === 'artifact_file') {
              // 文件内容开始意味着思考结束
              ensureThinkClosed();

              // 修复：后端返回的数据格式可能是：
              // 1. { type: "artifact_file", path: "...", code: "..." }
              // 2. { type: "artifact_file", content: "{\"path\":\"...\",\"code\":\"...\"}" }
              let filePath = parsed.path || '';
              let fileCode = parsed.code || '';

              // 如果 path/code 为空，尝试从 content 解析
              if (!filePath && parsed.content) {
                try {
                  // content 可能是 JSON 字符串
                  const contentObj =
                    typeof parsed.content === 'string'
                      ? JSON.parse(parsed.content)
                      : parsed.content;
                  filePath = contentObj.path || '';
                  fileCode = contentObj.code || '';
                } catch {
                  // 如果解析失败，content 可能就是普通字符串，忽略
                  console.warn('Failed to parse artifact_file content:', parsed.content);
                }
              }

              if (filePath && fileCode) {
                accumulatedFiles[filePath] = fileCode;
                console.log(
                  'Accumulated file:',
                  filePath,
                  'Total files:',
                  Object.keys(accumulatedFiles).length
                );

                const now = Date.now();
                if (now - lastUpdateTime > 100) {
                  // ⚡️ 修复：合并历史文件快照，防止局部更新时丢失旧文件
                  // 如果只传 accumulatedFiles，DashboardPreview 会以为只有这几个文件，导致应用崩溃或白屏
                  const mergedFiles = { ...currentFilesRef.current, ...accumulatedFiles };
                  if (onCodeUpdate) onCodeUpdate(mergedFiles);
                  lastUpdateTime = now;
                }
              }
              // 新增：处理 artifact_delta - 二次聊天时后端只返回修改的部分文件
              // 格式与 artifact_file 相同：{ type: "artifact_delta", content: "{\"path\":\"...\",\"code\":\"...\",\"status\":\"...\"}" }
            } else if (parsed.type === 'artifact_delta') {
              // 接收到 delta 意味着思考结束
              ensureThinkClosed();

              // 🔍 调试：打印原始数据
              console.log('🔍 artifact_delta received:', parsed);
              console.log('🔍 currentFilesRef.current keys:', Object.keys(currentFilesRef.current));

              // 解析 delta 内容，格式与 artifact_file 一致
              let filePath = parsed.path || '';
              let fileCode = parsed.code || '';

              // 如果 path/code 为空，尝试从 content 解析（与 artifact_file 保持一致）
              if (!filePath && parsed.content) {
                try {
                  const contentObj =
                    typeof parsed.content === 'string'
                      ? JSON.parse(parsed.content)
                      : parsed.content;
                  filePath = contentObj.path || '';
                  fileCode = contentObj.code || '';
                  console.log('🔍 Parsed from content:', { filePath, codeLength: fileCode.length });
                } catch (e) {
                  console.warn('Failed to parse artifact_delta content:', parsed.content, e);
                }
              }

              if (filePath && fileCode) {
                accumulatedFiles[filePath] = fileCode;
                console.log(
                  '✅ Accumulated delta file:',
                  filePath,
                  'Code length:',
                  fileCode.length,
                  'Total accumulated:',
                  Object.keys(accumulatedFiles).length
                );

                const now = Date.now();
                if (now - lastUpdateTime > 100) {
                  // 合并历史文件快照，防止局部更新时丢失旧文件
                  const mergedFiles = { ...currentFilesRef.current, ...accumulatedFiles };
                  console.log('🔍 Merged files keys:', Object.keys(mergedFiles));
                  if (onCodeUpdate) onCodeUpdate(mergedFiles);
                  lastUpdateTime = now;
                }
              } else {
                console.warn('❌ artifact_delta: filePath or fileCode is empty', {
                  filePath: !!filePath,
                  fileCode: !!fileCode,
                });
              }
            } else if (parsed.type === 'artifact_end') {
              ensureThinkClosed();
              console.log('Artifact end, total files:', Object.keys(accumulatedFiles).length);

              // ⚡️ 修复：最终合并并持久化
              const mergedFiles = { ...currentFilesRef.current, ...accumulatedFiles };
              // 关键：更新本地 ref 为完整的合并结果，而不只是增量部分
              updateLocalFiles(mergedFiles);

              if (onCodeUpdate) onCodeUpdate(mergedFiles);
              if (onCodeEnd) onCodeEnd();
              // 重置进度信息
              if (onProgressUpdate) onProgressUpdate(null);
            } else if (parsed.type === 'progress') {
              // 处理进度信息
              try {
                const progressData =
                  typeof parsed.content === 'string' ? JSON.parse(parsed.content) : parsed.content;

                const progressInfo: ProgressInfo = {
                  current: progressData.current || 0,
                  total: progressData.total || 0,
                  component: progressData.component || '',
                  stage: progressData.stage || '',
                };
                console.log('Progress update:', progressInfo);
                if (onProgressUpdate) onProgressUpdate(progressInfo);
              } catch {
                console.warn('Failed to parse progress content:', parsed.content);
              }
            } else if (parsed.type === 'thinking') {
              const content = parsed.content || '';
              if (content) {
                if (!accumulatedMessage.includes('<think>')) {
                  accumulatedMessage += '<think>';
                }
                accumulatedMessage += content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedMessage } : msg
                  )
                );
              }
            } else if (parsed.type === 'message') {
              // 显式处理 message 类型
              const content = parsed.content || parsed.text || parsed.delta || '';
              if (content) {
                ensureThinkClosed();

                accumulatedMessage += content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedMessage } : msg
                  )
                );
              }
            } else {
              // 未知类型，记录日志但不添加到消息
              console.log('Unknown message type:', parsed.type, parsed);
            }
          } catch (e) {
            console.warn('解析响应出错:', e);
          }
        }
      }
    } catch (error) {
      console.error('生成失败:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: `❌ 生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      updateLoadingState(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <PromptInputProvider>
      <FileAutoUploader onDatasetUploaded={(id) => (datasetIdRef.current = id)} />
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-lg font-bold">Generative BI Local</h1>
          </div>
          <p className="text-xs text-gray-400">Powered by Gemini Pro & Sandpack</p>
        </div>

        {/* Chat Area */}
        <Conversation className="flex-1 bg-slate-50">
          <ConversationContent className="p-4 gap-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Sparkles className="w-10 h-10 opacity-30" />}
                title="描述你的需求"
                description="例如：帮我画一个物流监控看板，要有深色主题，包含运输地图和延迟率趋势..."
              />
            ) : (
              messages.map((msg, index) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageContent
                    className={cn(
                      'text-sm',
                      msg.role === 'assistant' && 'bg-white border shadow-sm rounded-xl px-4 py-3',
                      msg.role === 'user' && '!bg-blue-100 !text-slate-800 !rounded-xl px-4 py-3'
                    )}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          {/* Parse and render thinking blocks vs main content */}
                          {(() => {
                            // Match think block, handling both closed and unclosed (streaming) tags
                            const thinkMatch = msg.content.match(
                              /<think>([\s\S]*?)(?:<\/think>|$)/
                            );
                            const thinkContent = thinkMatch ? thinkMatch[1] : null;

                            // Determine if thinking is still active or ended
                            const hasThinkingEnded = msg.content.includes('</think>');
                            const isThinking = msg.content.includes('<think>') && !hasThinkingEnded;

                            let mainContent = msg.content.replace(
                              /<think>[\s\S]*?(?:<\/think>|$)/,
                              ''
                            );
                            // Remove artifact blocks and self-closing tags
                            mainContent = mainContent.replace(/<artifact[\s\S]*?<\/artifact>/g, '');
                            mainContent = mainContent.replace(/<artifact[^>]*\/>/g, '');
                            mainContent = mainContent.trim();

                            return (
                              <>
                                {thinkContent && (
                                  <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-2 mb-3 text-gray-500 italic text-xs rounded-r">
                                    <div className="font-semibold not-italic mb-1 text-gray-400 flex items-center gap-2">
                                      <span>Thinking Process</span>
                                      {isThinking && (
                                        <div className="flex items-center gap-1 text-blue-500">
                                          <span className="text-xs">AI思考中</span>
                                          <Loader2 className="w-3 h-3 animate-spin" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="whitespace-pre-wrap">{thinkContent}</div>
                                  </div>
                                )}

                                {/* Loading for Dashboard Generation: Show after think ends, before message appears */}
                                {hasThinkingEnded &&
                                  !mainContent &&
                                  isLoading &&
                                  index === messages.length - 1 && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                      <span>看板生成中...</span>
                                    </div>
                                  )}

                                {mainContent && <Markdown>{mainContent}</Markdown>}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      )
                    ) : (
                      isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0">
          <ChatDragDropArea className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white">
            <AttachmentPreview />
            <PromptInput
              maxFiles={5}
              accept=".json,.csv"
              onSubmit={handleSendMessage}
              className="w-full"
            >
              <AttachmentButton />
              <PromptTextarea
                name="message"
                placeholder="描述您的需求，或拖拽上传csv,json数据文件（支持拖拽）..."
                className="h-[100px] text-sm"
              />
              <InputGroupButton
                disabled={isLoading || isLoadingProps}
                type="submit"
                className="mr-1 mb-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-8 h-8 flex items-center justify-center p-0 transition-all"
              >
                {isLoading || isLoadingProps ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </InputGroupButton>
            </PromptInput>
          </ChatDragDropArea>
        </div>
      </div>
    </PromptInputProvider>
  );
}
