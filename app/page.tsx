"use client";
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Menu, Database } from 'lucide-react';
import ChatOutput from '@/components/ChatOutput';
import ChatInput from '@/components/ChatInput';
import ParameterLibrary from '@/components/ParameterLibrary';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    input,
    messages,
    status,
    handleInputChange,
    handleSubmit,
  } = useChat();

  // 快捷提问示例
  const quickQuestions = [
    "查询 Mavic 4 Pro 的核心参数",
    "Mavic 4 Pro 续航时间是多少？",
    "对比 Mavic 4 Pro 和 Mini 4 Pro"
  ];

  // 处理快捷提问
  const handleQuickQuestion = (question: string) => {
    handleInputChange({ target: { value: question } } as any);
  };

  // 处理无人机选择
  const handleDroneSelect = (droneName: string) => {
    const question = `查询 ${droneName} 的核心参数`;
    handleInputChange({ target: { value: question } } as any);
    setShowSidebar(false); // 关闭侧边栏
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F7F9] to-[#E8EBF0]">
      {/* 顶部导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#1A1A1A]/95 backdrop-blur-sm py-2' : 'bg-[#1A1A1A]/90 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#D00000] rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full relative">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <span className={`font-bold text-white transition-all duration-300 ${
              isScrolled ? 'text-lg' : 'text-xl'
            }`}>
              DJI-DroneMind
            </span>
          </div>

          {/* 导航按钮 */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 hidden sm:flex"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Database className="w-4 h-4 mr-2" />
              参数库
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 sm:hidden"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex pt-16 sm:pt-20">
        {/* 聊天主区域 */}
        <main className={`flex-1 transition-all duration-300 ${
          showSidebar ? 'mr-0 sm:mr-80' : 'mr-0'
        }`}>
          <div className="h-screen flex flex-col">
            {/* 聊天消息区域 */}
            <div className="flex-1 overflow-hidden pb-32">
              {messages.length === 0 ? (
                // 空状态
                <div className="h-full flex flex-col items-center justify-center px-4">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-[#D00000] rounded-full flex items-center justify-center mb-4 mx-auto">
                      <div className="w-10 h-10 border-4 border-white rounded-full relative">
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">DJI-DroneMind</h2>
                    <p className="text-[#666666] mb-6">提问关于大疆无人机的任何问题，如参数、故障解决</p>
                  </div>
                  
                  {/* 示例问题卡片 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="p-4 bg-white rounded-lg shadow-sm border border-[#EEEEEE] hover:border-[#D00000] hover:shadow-md transition-all duration-200 text-left"
                      >
                        <p className="text-[#333333] text-sm">{question}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <ChatOutput messages={messages} status={status} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* 右侧辅助面板 */}
        <aside className={`fixed right-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-80 bg-white border-l-4 border-[#D00000] shadow-lg transform transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        } sm:block hidden`}>
          <div className="p-4 h-full flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ParameterLibrary onDroneSelect={handleDroneSelect} />
            </div>
          </div>
        </aside>

        {/* 移动端侧边栏遮罩 */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 sm:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </div>

      {/* 移动端底部弹窗 */}
      {showSidebar && (
        <div className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-xl shadow-lg z-50 sm:hidden">
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#1A1A1A]">参数库</h2>
              <button 
                onClick={() => setShowSidebar(false)}
                className="text-[#666666] hover:text-[#1A1A1A]"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ParameterLibrary onDroneSelect={handleDroneSelect} />
            </div>
          </div>
        </div>
      )}

      {/* 固定底部输入区域 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#EEEEEE] bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          {/* 快捷提问按钮 */}
          {messages.length > 0 && (
            <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
              {['查参数', '排故障', '对比机型'].map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(quickQuestions[index])}
                  className="flex-shrink-0 px-3 py-1 text-xs bg-[#FFECEC] text-[#D00000] rounded-full border border-[#D00000]/20 hover:bg-[#D00000] hover:text-white transition-colors duration-200"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          
          <ChatInput 
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}