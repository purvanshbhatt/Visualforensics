import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { ChatIcon, XIcon, RobotIcon } from '../constants';

interface ChatTutorProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

const ChatTutor: React.FC<ChatTutorProps> = ({ messages, isLoading, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div className={`fixed bottom-24 right-4 sm:right-8 w-[calc(100%-2rem)] sm:w-96 h-[60vh] max-h-[700px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-40 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <RobotIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-lg font-bold text-gray-200">Forensics Tutor</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat">
            <XIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <RobotIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />}
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3">
               <RobotIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
               <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-700 text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about a case or concept..."
              className="w-full p-2 pr-12 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 text-white rounded-md disabled:bg-cyan-800 disabled:cursor-not-allowed hover:bg-cyan-700 transition-colors" aria-label="Send message">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-8 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-all duration-300 ease-in-out z-50 transform hover:scale-110"
        aria-label="Open forensics tutor chat"
      >
        {isOpen ? <XIcon className="w-7 h-7" /> : <ChatIcon className="w-7 h-7" />}
      </button>
    </>
  );
};

export default ChatTutor;
