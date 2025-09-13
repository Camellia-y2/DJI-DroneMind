"use client";
import { Message } from "@ai-sdk/react";
import ReactMarkdown from 'react-markdown';
import { Wrench, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ChatOutputProps {
  messages: Message[];
  status: string; // 实际值：submitted/streaming/ready/error
}

export default function ChatOutput({ messages, status }: ChatOutputProps) {
  const [loadingText, setLoadingText] = useState('正在调取大疆官方参数');
  const [dots, setDots] = useState('');
  const [showLoading, setShowLoading] = useState(false); // 控制加载状态是否显示

  // 加载提示文本数组
  const loadingMessages = [
    '正在调取大疆官方参数',
    '正在分析无人机数据',
    '正在检索技术规格',
    '正在整理参数信息'
  ];

  // 监听 submitted/streaming 状态，触发加载动画
  useEffect(() => {
    console.log('当前 status:', status); // 方便调试，确认状态流转
    // 当 status 是 submitted时，视为“加载中”
    const isLoadingState = status === 'submitted';
    
    if (isLoadingState) {
      // 延迟 100ms 显示，避免网络快时加载状态一闪而过
      const timer = setTimeout(() => setShowLoading(true), 100);
      
      // 随机选择初始加载文本
      let messageIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingText(loadingMessages[messageIndex]);
      setDots('');

      // 点号动画 + 文本切换定时器
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            setLoadingText(loadingMessages[messageIndex]);
            return '';
          }
          return prev + '.';
        });
      }, 600);

      // 清除定时器（避免内存泄漏）
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    } else {
      // 非加载状态：隐藏加载框，重置动画
      setShowLoading(false);
      setDots('');
      setLoadingText('正在调取大疆官方参数');
    }
  }, [status]); // 依赖 status，状态变化时重新执行

  // 检测消息内容类型
  const getMessageType = (content: string) => {
    if (content.includes('故障') || content.includes('错误') || content.includes('问题')) {
      return 'troubleshoot';
    }
    if (content.includes('参数') || content.includes('规格') || content.includes('技术')) {
      return 'specs';
    }
    return 'normal';
  };

  return (
    <div className="space-y-4">
      {/* 消息列表 */}
      {messages.map((message, index) => {
        const messageType = message.role === 'assistant' ? getMessageType(message.content) : 'normal';
        
        return (
          <div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`max-w-[85%] sm:max-w-[75%] ${
              message.role === 'user' ? 'order-2' : 'order-1'
            }`}>
              {/* AI 消息图标 */}
              {message.role === 'assistant' && (
                <div className="flex items-center mb-2">
                  {messageType === 'troubleshoot' && (
                    <Wrench className="w-4 h-4 text-[#D00000] mr-2" />
                  )}
                  {messageType === 'specs' && (
                    <AlertTriangle className="w-4 h-4 text-[#FF8C00] mr-2" />
                  )}
                  <span className="text-xs text-[#666666] font-medium">
                    DJI-DroneMind
                  </span>
                </div>
              )}
              
              {/* 消息气泡 */}
              <div className={`px-4 py-3 rounded-lg border transition-all duration-200 ${
                message.role === 'user'
                  ? 'bg-[#FFECEC] border-[#D00000] text-[#333333] ml-4'
                  : 'bg-white border-[#CCCCCC] text-[#222222] mr-4 shadow-sm hover:shadow-md'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                
                {/* 消息时间戳 */}
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-[#D00000]/70' : 'text-[#666666]'
                }`}>
                  {new Date().toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* 加载状态判断改为 showLoading（兼容 submitted） */}
      {showLoading && (
        <div className="flex justify-start animate-in fade-in duration-300">
          <div className="max-w-[85%] sm:max-w-[75%]">
            <div className="flex items-center mb-2">
              <span className="text-xs text-[#666666] font-medium">
                DJI-DroneMind
              </span>
            </div>
            <div className="bg-white border border-[#CCCCCC] px-4 py-3 rounded-lg mr-4 shadow-sm">
              <div className="flex items-center space-x-3">
                {/* 旋转动画 */}
                <div className="relative">
                  <div className="w-5 h-5 border-2 border-[#D00000] border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-5 h-5 border-2 border-[#D00000] border-r-transparent rounded-full animate-spin" 
                       style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                {/* 加载文字（带点号动画） */}
                <div className="flex items-center space-x-1">
                  <span className="text-[#666666] text-sm font-medium">
                    {loadingText}{dots}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 错误状态（原有逻辑不变，确保 status = 'error' 时显示） */}
      {status === 'error' && (
        <div className="flex justify-start">
          <div className="max-w-[85%] sm:max-w-[75%]">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 text-[#D00000] mr-2" />
              <span className="text-xs text-[#666666] font-medium">
                DJI-DroneMind
              </span>
            </div>
            <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mr-4">
              <span className="text-red-600 text-sm">抱歉，处理您的请求时出现了错误，请稍后重试。</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}