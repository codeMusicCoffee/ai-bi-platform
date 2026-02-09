/*
 * @Author: 'txy' '841067099@qq.com'
 * @Date: 2025-12-29 22:20:34
 * @LastEditors: 'txy' '841067099@qq.com'
 * @LastEditTime: 2025-12-30 11:47:35
 * @FilePath: \ai-bi-platform\next.config.ts
 * @Description: Next.js 配置 - 静态导出模式
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出模式 - 生成纯 HTML/CSS/JS，使用 Nginx 托管
  output: "export",
  images: { unoptimized: true },
  devIndicators: false,

  // 可选：生成 .html 后缀的文件
  // trailingSlash: true,
};

export default nextConfig;
