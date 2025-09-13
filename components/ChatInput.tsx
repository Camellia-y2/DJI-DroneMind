"use client";
import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: any) => void;
  handleSubmit: (e: any) => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
}: ChatInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await handleSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-3">
      {/* 输入框 */}
      <div className="flex-1 relative">
        <Input
          onChange={handleInputChange}
          value={input}
          placeholder="输入你的问题，如'Mavic 4 Pro 的传感器尺寸是多少？'"
          className="w-full h-12 px-4 pr-12 rounded-3xl border-2 border-[#EEEEEE] focus:border-[#D00000] focus:ring-0 focus:ring-offset-0 bg-white text-[#333333] placeholder:text-[#999999] transition-colors duration-200"
          disabled={isSubmitting}
        />
        
        {/* 输入状态指示 */}
        {isSubmitting && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-xs text-[#666666]">发送中...</span>
          </div>
        )}
      </div>

      {/* 发送按钮 */}
      <Button
        type="submit"
        disabled={!input.trim() || isSubmitting}
        className="w-12 h-12 rounded-full bg-[#D00000] hover:bg-[#B00000] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center p-0"
      >
        <Send className="w-5 h-5 text-white" />
      </Button>
    </form>
  );
}