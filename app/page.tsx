import { redirect } from 'next/navigation';

export default function RootPage() {
  // 修改默认路由为 /manage，原逻辑为 redirect('/aichat')
  // redirect('/aichat');
  redirect('/manage');
}
