/*
 * @Author: 'txy' '841067099@qq.com'
 * @Date: 2025-12-30 10:38:29
 * @LastEditors: 'txy' '841067099@qq.com'
 * @LastEditTime: 2025-12-30 12:36:32
 * @FilePath: \ai-bi-platform\constants\index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 使用空字符串，让请求通过 Next.js 代理
// 使用环境变量，如果未定义则回退到 '/api'
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
export const DEFAULT_PAGE_SIZE = 10;
export const APP_NAME = 'AI BI Platform';
