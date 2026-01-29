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
  initialArtifactId,
  onFetchComplete,
  onArtifactReady,
}: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const datasetIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (initialArtifactId) {
      const fetchInitialArtifact = async () => {
        try {
          updateLoadingState(true);
          console.log('📦 [AiChat] fetching initial artifact by id:', initialArtifactId);
          const artRes = await chatService.getArtifact(initialArtifactId);
          if (artRes.success && artRes.data?.files) {
            const filesFromApi: Record<string, string> = {};
            artRes.data.files.forEach((f: any) => {
              filesFromApi[f.path] = f.code;
            });
            updateLocalFiles(filesFromApi);
            // 新实现：通知父组件 artifact 数据已获取，由父组件控制渲染时机
            if (onArtifactReady) onArtifactReady(filesFromApi);
          }
        } catch (err) {
          console.error('Failed to fetch initial artifact:', err);
        } finally {
          updateLoadingState(false);
          // 新增：通知父组件 artifact 数据加载完成
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
        const response = await chatService.getSession(sessionId);
        if (!response.success) {
          if (response.code === 404) return;
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

          const messagesWithArtifacts = [...data.messages].reverse();
          const msgWithArtifact = messagesWithArtifacts.find(
            (msg: any) => Array.isArray(msg.artifacts) && msg.artifacts.length > 0
          );

          if (msgWithArtifact) {
            const lastArtifact = msgWithArtifact.artifacts[msgWithArtifact.artifacts.length - 1];

            const processArtifact = (code: any) => {
              const filesObj = typeof code === 'string' ? { '/App.tsx': code } : code;
              updateLocalFiles(filesObj);
              // 新实现：通知父组件 artifact 数据已获取，由父组件控制渲染时机
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
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        updateLoadingState(false);
        // 新增：通知父组件 session 数据加载完成
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
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
          session_id: sessionId,
          dataset_id: datasetIdRef.current,
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
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: `❌ 失败: ${error}`,
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
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Sparkles className="w-5 h-5" />
            <h1 className="text-lg font-bold">Generative BI Local</h1>
          </div>
          <p className="text-xs text-gray-400">Powered by Gemini Pro & Sandpack</p>
        </div>

        <Conversation className="flex-1 bg-slate-50">
          <ConversationContent className="p-4 gap-6">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Sparkles className="w-10 h-10 opacity-30" />}
                title="描述你的需求"
                description="例如：帮我画一个物流监控看板..."
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
                                  <div className="bg-gray-50 border-l-2 border-gray-300 pl-3 py-2 mb-3 text-gray-500 italic text-xs rounded-r">
                                    <div className="font-semibold not-italic mb-1 text-gray-400 flex items-center gap-2">
                                      <span>Thinking Process</span>
                                      {isThinking && <Loader2 className="w-3 h-3 animate-spin" />}
                                    </div>
                                    <div className="whitespace-pre-wrap">{thinkContent}</div>
                                  </div>
                                )}
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
                placeholder="描述您的需求..."
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
