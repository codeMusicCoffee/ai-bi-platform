import type { Metadata } from 'next';
import './globals.css'; // 👈 必须引入这个文件！

export const metadata: Metadata = {
  title: 'AI BI Platform',
  description: 'Generative UI Dashboard powered by Gemini',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: 抑制浏览器扩展注入属性导致的 hydration 警告
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://sandpack.codesandbox.io" />
        <link rel="dns-prefetch" href="https://sandpack.codesandbox.io" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
