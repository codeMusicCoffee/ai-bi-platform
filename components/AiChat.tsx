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

interface AiChatProps {
  onCodeUpdate?: (code: string) => void;
  onCodeEnd?: () => void;
  onStatusChange?: (isLoading: boolean) => void;
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
    <PromptInputAttachments className="pb-2">
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

export default function AiChat({
  onCodeUpdate,
  onCodeEnd,
  onStatusChange,
  isLoadingProps,
}: AiChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const isSubmittingRef = useRef(false);

  // Generate a unique ID
  const generateId = () => Math.random().toString(36).substring(7);

  const { sessionId, setSessionId } = useChatStore();

  // Load chat history when sessionId is available

  useEffect(() => {
    console.log('sessionId', sessionId);
    if (!sessionId) return;
    const fetchSession = async () => {
      try {
        updateLoadingState(true);
        const backendUrl = 'http://192.168.151.201:8000';
        const res = await fetch(`${backendUrl}/api/sessions/${sessionId}`);

        if (!res.ok) {
          if (res.status === 404) {
            console.warn('Session not found, clearing local session');
            // Optionally clear invalid session: setSessionId(null);
            return;
          }
          throw new Error('Failed to fetch session');
        }

        const data = await res.json();

        if (data.messages && Array.isArray(data.messages)) {
          const history: ChatMessage[] = data.messages.map((msg: any, index: number) => ({
            id: msg.id || `history-${index}-${Date.now()}`,
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now(),
          }));
          setMessages(history);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        updateLoadingState(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Wrapper for setting loading state and notifying parent
  const updateLoadingState = (loading: boolean) => {
    setIsLoading(loading);
    if (onStatusChange) {
      onStatusChange(loading);
    }
  };

  const handleSendMessage = async (input: { text: string; files: any[] }) => {
    const userText = input.text.trim();
    // Allow empty text if there are files (though usually we want text descriptions for files)
    if ((!userText && input.files.length === 0) || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    updateLoadingState(true);

    // Update UI immediately
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
      const backendUrl = 'http://192.168.151.201:8000';

      // 1. Upload files first if any
      if (input.files.length > 0) {
        for (const filePart of input.files) {
          if (filePart.url) {
            const file = dataURLtoFile(filePart.url, filePart.filename || 'file');
            if (file) {
              const formData = new FormData();
              formData.append('file', file);
              currentSessionId && formData.append('session_id', currentSessionId);
              // formData.append('name', file.name);

              try {
                const uploadRes = await fetch(`${backendUrl}/api/datasets`, {
                  method: 'POST',
                  body: formData,
                });
                if (!uploadRes.ok) {
                  console.error('File upload failed', await uploadRes.text());
                } else {
                  console.log('File uploaded successfully', file.name);
                }
              } catch (e) {
                console.error('File upload error', e);
              }
            }
          }
        }
      }

      // 2. Send Chat Message
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
          session_id: currentSessionId,
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

      let accumulatedCode = '';
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
            } else if (parsed.type === 'artifact_code') {
              // Code starting implies thinking ended
              ensureThinkClosed();

              const content = parsed.content || parsed.text || '';
              accumulatedCode += content;

              const now = Date.now();
              if (now - lastUpdateTime > 100) {
                if (onCodeUpdate) onCodeUpdate(accumulatedCode);
                lastUpdateTime = now;
              }
            } else if (parsed.type === 'artifact_end') {
              ensureThinkClosed();
              if (onCodeUpdate) onCodeUpdate(accumulatedCode);
              if (onCodeEnd) onCodeEnd();
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
            } else {
              // Message content
              const content = parsed.content || parsed.text || parsed.delta || '';
              if (content) {
                // If we were thinking, now we are messaging, so close think
                ensureThinkClosed();

                accumulatedMessage += content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulatedMessage } : msg
                  )
                );
              }
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
            messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent
                  className={cn(
                    'text-sm',
                    msg.role === 'assistant' && 'bg-white border shadow-sm rounded-xl px-4 py-3'
                  )}
                >
                  {msg.content ? (
                    msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        {/* Parse and render thinking blocks vs main content */}
                        {(() => {
                          // Match think block, handling both closed and unclosed (streaming) tags
                          const thinkMatch = msg.content.match(/<think>([\s\S]*?)(?:<\/think>|$)/);
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
                              {hasThinkingEnded && !mainContent && (
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
        <PromptInputProvider>
          <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white">
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
                placeholder="描述你的需求，或上传数据文件..."
                className="min-h-[60px] max-h-[200px] text-sm"
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
          </div>
        </PromptInputProvider>
      </div>
    </div>
  );
}
