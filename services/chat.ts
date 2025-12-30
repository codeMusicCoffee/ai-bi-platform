/*
 * @Author: 'txy' '841067099@qq.com'
 * @Date: 2025-12-30 10:46:01
 * @LastEditors: 'txy' '841067099@qq.com'
 * @LastEditTime: 2025-12-30 14:27:48
 * @FilePath: \ai-bi-platform\services\chat.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import request from '@/lib/request';

export interface ChatGenerateResponse {
  code: string;
  explanation?: string;
}

export const chatService = {
  /**
   * Send a message to the AI to generate dashboard code
   * @param message User's requirement description
   * @returns Generated code and other metadata
   */
  generateDashboard: (message: string) => {
    return request.post<ChatGenerateResponse>('/api/chat', {
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      provider: "deepseek"
    });
  },
  testHealth: () => {
    return request.get('/health');
  }
};
