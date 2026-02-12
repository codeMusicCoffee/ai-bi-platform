'use client';

import {
  Conversation,
  ConversationContent,
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
import { Loader2, Paperclip, Sparkles } from 'lucide-react';
import { ComponentProps, Fragment, useEffect, useRef, useState } from 'react';

// Message interface
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: string;
}

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
  initialArtifactId?: string | null;
  // 新增：session 数据获取完成后触发，用于父组件判断是否显示空状态
  onFetchComplete?: () => void;
  // 新增：artifact 数据获取完成后触发，用于双条件渲染（等沙箱就绪后再渲染）
  onArtifactReady?: (files: Record<string, string>) => void;
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

// 新实现：定义 SuggestedPromptButton 组件，将点击行为改为在输入框后追加内容而不直接发送
const SuggestedPromptButton = ({ prompt }: { prompt: string }) => {
  const { textInput } = usePromptInputController();
  return (
    <button
      onClick={() => {
        // 新实现：改为追加内容而非替换原有内容
        const currentVal = textInput.value || '';
        textInput.setInput(currentVal + prompt);
      }}
      className="text-left p-3.5 text-[13px] text-gray-600 bg-white/40 hover:bg-blue-50/60 border border-transparent hover:border-blue-100 rounded-[10px] transition-all duration-300 shadow-sm"
    >
      {prompt}
    </button>
  );
};

// Helper to convert dataURL to File
function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',');
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
      for (const filePart of files) {
        if (uploadedFileIds.current.has(filePart.id)) continue;
        if (!filePart.url) continue;

        uploadedFileIds.current.add(filePart.id);

        let file: File | null = null;
        if (filePart.url.startsWith('blob:')) {
          try {
            const response = await fetch(filePart.url);
            const blob = await response.blob();
            file = new File([blob], filePart.filename || 'file', {
              type: blob.type,
            });
          } catch (error) {
            console.error('Error fetching blob:', error);
          }
        } else {
          file = dataURLtoFile(filePart.url, filePart.filename || 'file');
        }

        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          if (sessionId) {
            formData.append('session_id', sessionId);
          }

          try {
            const response = await chatService.uploadDataset(formData);
            if (!response.success) {
              uploadedFileIds.current.delete(filePart.id);
            } else {
              const data = response.data;
              if (data.session_id && data.session_id !== sessionId) {
                setSessionId(data.session_id);
              }
              if (data.id) {
                onDatasetUploaded(data.id);
              }
            }
          } catch (e) {
            uploadedFileIds.current.delete(filePart.id);
          }
        }
      }
    };

    handleUpload();
  }, [files, sessionId, setSessionId, onDatasetUploaded]);

  return null;
};

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
          <p className="text-sm font-bold text-indigo-700">放入 json、csv 文件</p>
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
  initialArtifactId,
  onFetchComplete,
  onArtifactReady,
}: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const isSubmittingRef = useRef(false);
  const datasetIdRef = useRef<string | null>(null);
  const baseArtifactIdRef = useRef<string | null>(initialArtifactId || null);
  const initialMessageLengthCapturedRef = useRef(false);
  const [initialMessageLength, setInitialMessageLength] = useState(0);

  const [suggestedPrompts] = useState([
    '把【图表名称】【图形类型】的指标调整成【指标值】',
    '把【图表名称】【图形类型】的图形类型调整成【图形类型】',
    '把【图表名称】【图形类型】的【元素】调整为【颜色】',
    '把【图表名称】【图形类型】和【图表名称】【图形类型】的位置互换',
  ]);

  const currentFilesRef = useRef<Record<string, string>>({});

  const updateLocalFiles = (files: Record<string, string>) => {
    currentFilesRef.current = { ...currentFilesRef.current, ...files };
  };

  const generateId = () => Math.random().toString(36).substring(7);

  const { sessionId, setSessionId } = useChatStore();

  const updateLoadingState = (loading: boolean) => {
    setIsLoading(loading);
    if (onStatusChange) {
      onStatusChange(loading);
    }
  };

  const refreshSessionData = async (targetSessionId: string) => {
    const response = await chatService.getSession(targetSessionId);
    if (!response.success) {
      if (response.code === 404) {
        setMessages([]);
        if (!initialMessageLengthCapturedRef.current) {
          setInitialMessageLength(0);
          initialMessageLengthCapturedRef.current = true;
        }
        return;
      }
      throw new Error('Failed to fetch session');
    }

    const data = response.data;
    if (!(data.messages && Array.isArray(data.messages))) return;

    const history: ChatMessage[] = data.messages.map((msg: any, index: number) => ({
      id: msg.id || `history-${index}-${Date.now()}`,
      role: msg.role,
      content: msg.content,
      timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now(),
      status: msg.status,
    }));
    setMessages(history);
    if (!initialMessageLengthCapturedRef.current) {
      setInitialMessageLength(history.length);
      initialMessageLengthCapturedRef.current = true;
    }

    const messagesWithArtifacts = [...data.messages].reverse();
    const msgWithArtifact = messagesWithArtifacts.find(
      (msg: any) => Array.isArray(msg.artifacts) && msg.artifacts.length > 0
    );

    if (!msgWithArtifact) {
      baseArtifactIdRef.current = null;
      return;
    }

    if (msgWithArtifact) {
      const lastArtifact = msgWithArtifact.artifacts[msgWithArtifact.artifacts.length - 1];
      if (lastArtifact?.id) {
        baseArtifactIdRef.current = lastArtifact.id;
      }

      const processArtifact = (code: any) => {
        const filesObj = typeof code === 'string' ? { '/App.tsx': code } : code;
        updateLocalFiles(filesObj);
        if (onArtifactReady) onArtifactReady(filesObj);
      };

      if (lastArtifact.code) {
        processArtifact(lastArtifact.code);
      } else if (lastArtifact.id) {
        try {
          const artRes = await chatService.getArtifact(lastArtifact.id);
          if (artRes.success && artRes.data?.files) {
            const filesFromApi: Record<string, string> = {};
            artRes.data.files.forEach((f: any) => {
              filesFromApi[f.path] = f.code;
            });
            processArtifact(filesFromApi);
          }
        } catch (err) {
          console.error('Failed to fetch artifact details:', err);
        }
      }
    }
  };

  useEffect(() => {
    baseArtifactIdRef.current = initialArtifactId || null;
  }, [initialArtifactId]);

  useEffect(() => {
    if (initialArtifactId) {
      const fetchInitialArtifact = async () => {
        try {
          updateLoadingState(true);
          console.log('[AiChat] fetching initial artifact by id:', initialArtifactId);
          const artRes = await chatService.getArtifact(initialArtifactId);
          if (artRes.success && artRes.data?.files) {
            const filesFromApi: Record<string, string> = {};
            artRes.data.files.forEach((f: any) => {
              filesFromApi[f.path] = f.code;
            });
            updateLocalFiles(filesFromApi);
            if (onArtifactReady) onArtifactReady(filesFromApi);
          }
        } catch (err) {
          console.error('Failed to fetch initial artifact:', err);
        } finally {
          updateLoadingState(false);
          if (onFetchComplete) onFetchComplete();
        }
      };
      fetchInitialArtifact();
      if (!sessionId) return;
    }

    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        updateLoadingState(true);
        await refreshSessionData(sessionId);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        updateLoadingState(false);
        if (onFetchComplete) onFetchComplete();
      }
    };
    fetchSession();
  }, [sessionId, initialArtifactId]);

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

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const requestContent =
        userText || (input.files.length > 0 ? `[Uploaded ${input.files.length} files]` : '');
      let latestSessionId = sessionId || '';
      const endpoint = sessionId
        ? `${baseUrl}/api/chat/sessions/${encodeURIComponent(sessionId)}/messages`
        : `${baseUrl}/api/chat`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          content: requestContent,
          ...(baseArtifactIdRef.current ? { base_artifact_id: baseArtifactIdRef.current } : {}),
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      let isFinished = false;
      let lastUpdateTime = 0;

      const assistantMsgId = generateId();
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', timestamp: Date.now() },
      ]);

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
            const ensureThinkClosed = () => {
              if (
                accumulatedMessage.includes('<think>') &&
                !accumulatedMessage.includes('</think>')
              ) {
                accumulatedMessage += '</think>';
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedMessage } : msg
                  )
                );
              }
            };

            if (parsed.type === 'session_id') {
              latestSessionId = parsed.content || latestSessionId;
              setSessionId(parsed.content);
            } else if (parsed.type === 'artifact_start') {
              ensureThinkClosed();
            } else if (parsed.type === 'artifact_file' || parsed.type === 'artifact_delta') {
              ensureThinkClosed();
              let filePath = parsed.path || '';
              let fileCode = parsed.code || '';
              if (!filePath && parsed.content) {
                try {
                  const contentObj =
                    typeof parsed.content === 'string'
                      ? JSON.parse(parsed.content)
                      : parsed.content;
                  filePath = contentObj.path || '';
                  fileCode = contentObj.code || '';
                } catch {}
              }
              if (filePath && fileCode) {
                accumulatedFiles[filePath] = fileCode;
                const now = Date.now();
                if (now - lastUpdateTime > 100) {
                  const mergedFiles = { ...currentFilesRef.current, ...accumulatedFiles };
                  if (onCodeUpdate) onCodeUpdate(mergedFiles);
                  lastUpdateTime = now;
                }
              }
            } else if (parsed.type === 'artifact_end') {
              const eventArtifactId =
                parsed.artifact_id ||
                parsed.id ||
                (typeof parsed.content === 'object' ? parsed.content?.artifact_id : undefined);
              if (typeof eventArtifactId === 'string' && eventArtifactId) {
                baseArtifactIdRef.current = eventArtifactId;
              }
              ensureThinkClosed();
              const mergedFiles = { ...currentFilesRef.current, ...accumulatedFiles };
              updateLocalFiles(mergedFiles);
              if (onCodeUpdate) onCodeUpdate(mergedFiles);
              if (onCodeEnd) onCodeEnd();
              if (onProgressUpdate) onProgressUpdate(null);
            } else if (parsed.type === 'progress') {
              try {
                const progressData =
                  typeof parsed.content === 'string' ? JSON.parse(parsed.content) : parsed.content;
                const progressInfo: ProgressInfo = {
                  current: progressData.current || 0,
                  total: progressData.total || 0,
                  component: progressData.component || '',
                  stage: progressData.stage || '',
                };
                if (onProgressUpdate) onProgressUpdate(progressInfo);
              } catch {}
            } else if (parsed.type === 'thinking') {
              const content = parsed.content || '';
              if (content) {
                if (!accumulatedMessage.includes('<think>')) accumulatedMessage += '<think>';
                accumulatedMessage += content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedMessage } : msg
                  )
                );
              }
            } else if (parsed.type === 'message') {
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
            }
          } catch (e) {}
        }
      }

      if (latestSessionId) {
        try {
          await refreshSessionData(latestSessionId);
        } catch (refreshError) {
          console.error('Error refreshing session after send message:', refreshError);
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: `失败: ${error}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      updateLoadingState(false);
      isSubmittingRef.current = false;
    }
  };

  const handleWithdraw = async () => {
    if (!sessionId || isLoading || isSubmittingRef.current || isWithdrawing) return;

    setIsWithdrawing(true);
    updateLoadingState(true);
    if (onProgressUpdate) onProgressUpdate(null);

    try {
      const response = await chatService.withdrawSession(sessionId);
      if (!response.success) {
        throw new Error('Failed to withdraw the last turn');
      }
      await refreshSessionData(sessionId);
    } catch (error) {
      console.error('Error withdrawing session:', error);
    } finally {
      setIsWithdrawing(false);
      updateLoadingState(false);
    }
  };

  const shouldHideWithdrawForMessage = (content: string) => {
    const text = content.trim();
    return /HTTP\s*404/i.test(text) && /(error|错误)/i.test(text);
  };

  const assistantMessageCount = messages.filter((m) => m.role === 'assistant').length;
  const lastAssistantMessageId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;
  const promptInsertIndex = Math.min(initialMessageLength, messages.length);

  return (
    <PromptInputProvider>
      <FileAutoUploader onDatasetUploaded={(id) => (datasetIdRef.current = id)} />
      <div className="flex flex-col h-full bg-linear-to-b from-[#EBF2FF] to-[#F5F8FF] border-[2px] border-white/100 rounded-[10px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-3 shrink-0">
          <img src="/images/aichat/robot.svg" />
          <img src="/images/aichat/title.svg" />
        </div>

        <Conversation className="flex-1 bg-transparent!">
          <ConversationContent className="px-5 py-4 gap-4">
            {messages.map((msg, index) => (
              <Fragment key={msg.id}>
                {index === promptInsertIndex && (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="bg-white/80 backdrop-blur-md rounded-[12px] p-4 shadow-sm text-[14px] leading-relaxed text-gray-700 border border-white/40">
                      您好！我是你的看板调整助手，我可以帮你完成数据逻辑更改、布局结构调整、图表视觉调整、全局配置等任务。
                    </div>

                    <div className="bg-white/80 backdrop-blur-md rounded-[12px] p-4 shadow-sm border border-white/40">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[14px] font-bold text-gray-800">您可以这样说</span>
                        <button className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-blue-500 transition-colors">
                          <Sparkles className="w-3.5 h-3.5" />
                          换一批
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {suggestedPrompts.map((prompt, i) => (
                          // 新实现：使用 SuggestedPromptButton，使点击建议词仅填充输入框而不直接发送
                          <SuggestedPromptButton key={i} prompt={prompt} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <Message from={msg.role}>
                  <MessageContent
                    className={cn(
                      'text-sm max-w-[88%] px-4 py-3',
                      msg.role === 'assistant'
                        ? 'bg-white text-gray-700'
                        : 'bg-[#0470ff] text-white'
                    )}
                    style={{
                      borderRadius:
                        msg.role === 'assistant' ? '2px 16px 16px 16px' : '16px 2px 16px 16px',
                    }}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none text-gray-700">
                          {(() => {
                            const thinkMatch = msg.content.match(
                              /<think>([\s\S]*?)(?:<\/think>|$)/
                            );
                            const thinkContent = thinkMatch ? thinkMatch[1] : null;
                            const hasThinkingEnded = msg.content.includes('</think>');
                            const isThinking = msg.content.includes('<think>') && !hasThinkingEnded;
                            let mainContent = msg.content
                              .replace(/<think>[\s\S]*?(?:<\/think>|$)/, '')
                              .replace(/<artifact[\s\S]*?<\/artifact>/g, '')
                              .replace(/<artifact[^>]*\/>/g, '')
                              .trim();
                            return (
                              <>
                                {thinkContent && (
                                  <div className="bg-gray-50/80 border-l-2 border-gray-300 pl-3 py-2 mb-3 text-gray-500 italic text-xs rounded-r">
                                    <div className="font-bold not-italic mb-1 text-gray-400 flex items-center gap-1.5">
                                      <span>思考过程</span>
                                      {isThinking && (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      )}
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed opacity-80">
                                      {thinkContent}
                                    </div>
                                  </div>
                                )}
                                {hasThinkingEnded &&
                                  !mainContent &&
                                  isLoading &&
                                  index === messages.length - 1 && (
                                    <div className="flex items-center gap-2 text-gray-400 text-xs py-2">
                                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                      <span>正在构建预览内容...</span>
                                    </div>
                                  )}
                                {mainContent && <Markdown>{mainContent}</Markdown>}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                      )
                    ) : (
                      isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                    )}
                    {msg.role === 'assistant' && (
                      <>
                        {msg.status === 'withdrawn' ? (
                          <div className="mt-3 flex justify-end">
                            <div className="inline-flex items-center gap-1 text-[14px] font-medium text-blue-400 leading-none cursor-default select-none opacity-60">
                              <img src="/images/aichat/back.svg" className="w-[14px] h-[14px]" />
                              <span>已撤销</span>
                            </div>
                          </div>
                        ) : (
                          assistantMessageCount >= 2 &&
                          msg.id === lastAssistantMessageId &&
                          !!sessionId &&
                          !shouldHideWithdrawForMessage(msg.content || '') &&
                          !!msg.content?.trim() &&
                          // 新增 !isLoading 判断：思考过程中不显示撤销按钮
                          !isLoading && (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={handleWithdraw}
                                disabled={isLoading || isWithdrawing || isLoadingProps}
                                className="inline-flex items-center gap-1 text-[14px] font-medium text-[#306EFD] leading-none hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <img src="/images/aichat/back.svg" className="w-[14px] h-[14px]" />
                                <span>撤销</span>
                              </button>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </MessageContent>
                </Message>
              </Fragment>
            ))}
            {promptInsertIndex === messages.length && (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-white/80 backdrop-blur-md rounded-[12px] p-4 shadow-sm text-[14px] leading-relaxed text-gray-700 border border-white/40">
                  您好！我是你的看板调整助手，我可以帮你完成数据逻辑更改、布局结构调整、图表视觉调整、全局配置等任务。
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-[12px] p-4 shadow-sm border border-white/40">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[14px] font-bold text-gray-800">您可以这样说</span>
                    <button className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-blue-500 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" />
                      换一批
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {suggestedPrompts.map((prompt, i) => (
                      // 新实现：使用 SuggestedPromptButton，使点击建议词仅填充输入框而不直接发送
                      <SuggestedPromptButton key={i} prompt={prompt} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input Area */}
        <div className="flex justify-center px-4 pb-6 shrink-0 ">
          <div
            className="bg-white rounded-[8px] relative border border-gray-200 focus-within:border-[#306EFD] overflow-hidden"
            style={{
              width: '348px',
              height: '80px',
              boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.08)',
            }}
          >
            <ChatDragDropArea className="h-full">
              <PromptInput
                maxFiles={5}
                accept=".json,.csv"
                onSubmit={handleSendMessage}
                className="w-full h-full flex flex-col relative"
              >
                <PromptTextarea
                  name="message"
                  className="flex-1 w-full bg-transparent border-0! ring-0! outline-none! focus:ring-0! focus:outline-none! p-3 pb-8 text-[14px] text-gray-800 placeholder:text-gray-400 leading-normal resize-none shadow-none"
                  style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
                />
                <style jsx global>{`
                  textarea::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <InputGroupButton
                  disabled={isLoading || isLoadingProps}
                  type="submit"
                  className={cn(
                    'absolute right-2 bottom-1 w-6 h-6 flex items-center justify-center p-0 rounded-full transition-all duration-300 border-none shadow-none outline-hidden cursor-pointer',
                    'bg-[#306EFD] hover:bg-[#285ad4] text-white disabled:opacity-40 disabled:grayscale'
                  )}
                >
                  {isLoading || isLoadingProps ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <img src="/images/aichat/send.svg" className="w-full h-full" alt="send" />
                  )}
                </InputGroupButton>
              </PromptInput>
            </ChatDragDropArea>
          </div>
        </div>
      </div>
    </PromptInputProvider>
  );
}
