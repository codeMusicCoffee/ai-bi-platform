/*
 * @Author: 'txy' '841067099@qq.com'
 * @Date: 2025-12-29 22:20:34
 * @LastEditors: 'txy' '841067099@qq.com'
 * @LastEditTime: 2025-12-30 11:47:35
 * @FilePath: \ai-bi-platform\next.config.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() { 
    return [
      {
        source: "/test/:path*",
        // 生产环境将从环境变量读取后端地址，添加 fallback 防止启动报错
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
