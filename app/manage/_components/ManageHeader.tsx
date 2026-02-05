'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function ManageHeader() {
  return (
    <header
      className="h-16 text-white flex items-center justify-between px-6 shrink-0 z-10 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <div className="flex items-center space-x-2">
        <img src="/images/icon.svg" alt="logo icon" className="h-[26px]" />
        <img src="/images/title.svg" alt="logo title" className="h-[28px]" />
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative w-[180px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/90" />
          <Input
            placeholder="输入搜索关键词"
            className="bg-transparent border border-white/80 text-white placeholder:text-white/80 rounded-full h-9 px-5 pr-12 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatar.png" />
          </Avatar>
          <span className="text-sm font-medium">管理员</span>
        </div>
      </div>
    </header>
  );
}
