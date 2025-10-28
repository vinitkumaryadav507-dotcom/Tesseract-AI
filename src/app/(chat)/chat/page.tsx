"use client";

import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '@/lib/actions';
import type { Message, ChatSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Settings, MessageSquare, Menu } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { ChatMessage } from '@/components/chat-message';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Load chat history from local storage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('chatHistory');
      if (savedHistory) {
        setChatHistory(JSON.parse(savedHistory));
      }
      const savedActiveId = localStorage.getItem('activeChatId');
      if (savedActiveId) {
        setActiveChatId(savedActiveId);
        const activeChat = JSON.parse(savedHistory || '[]').find((c: ChatSession) => c.id === savedActiveId);
        if (activeChat) {
          setMessages(activeChat.messages);
        }
      } else {
        startNewChat();
      }
    } catch (error) {
      console.error("Failed to load from local storage", error);
      startNewChat();
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
      if (activeChatId) {
        localStorage.setItem('activeChatId', activeChatId);
      }
    } catch (error) {
      console.error("Failed to save to local storage", error);
    }
  }, [chatHistory, activeChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update the current chat session in history
    setChatHistory(prevHistory => {
        return prevHistory.map(chat =>
            chat.id === activeChatId ? { ...chat, messages: newMessages, title: newMessages.length === 1 ? 'New Chat' : chat.title } : chat
        );
    });

    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessage(newMessages);
      if (aiResponse && aiResponse.content) {
        const modelMessage: Message = { role: 'model', content: aiResponse.content };
        const finalMessages = [...newMessages, modelMessage];
        setMessages(finalMessages);
        
        let chatTitle = 'New Chat';
        if (newMessages.length === 1) {
            // This is a simplified title logic, for a smarter one we'd use another AI call
            chatTitle = input.substring(0, 30) + (input.length > 30 ? '...' : '');
        }

        setChatHistory(prevHistory => {
            const currentChat = prevHistory.find(chat => chat.id === activeChatId);
            return prevHistory.map(chat =>
                chat.id === activeChatId ? { ...chat, messages: finalMessages, title: newMessages.length === 1 ? chatTitle : currentChat?.title || 'Chat' } : chat
            );
        });

      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
       setChatHistory(prevHistory => {
            return prevHistory.map(chat =>
                chat.id === activeChatId ? { ...chat, messages: finalMessages } : chat
            );
        });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    const newChatId = uuidv4();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setMessages([]);
  };

  const switchChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setActiveChatId(chatId);
      setMessages(chat.messages);
    }
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      const nextChat = chatHistory.find(c => c.id !== chatId) || chatHistory[0];
      if (nextChat) {
        switchChat(nextChat.id);
      } else {
        startNewChat();
      }
    }
  };

  const clearAllChats = () => {
    setChatHistory([]);
    setActiveChatId(null);
    setMessages([]);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('activeChatId');
    startNewChat();
    toast({
        title: "Chat history cleared",
        description: "All your conversations have been deleted.",
    });
  }
  
  const handleTitleClick = () => {
     localStorage.removeItem('chatHistory');
     localStorage.removeItem('activeChatId');
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-muted/40">
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" onClick={handleTitleClick} className="flex items-center gap-2 group">
            <TesseractLogo className="size-8 transition-transform group-hover:rotate-12" />
            <h1 className="text-lg font-semibold tracking-tight font-headline">Tesseract AI</h1>
          </Link>
        </div>
        <div className="p-2">
            <Button onClick={startNewChat} className="w-full justify-start">
                <Plus className="mr-2" />
                New Chat
            </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
            {chatHistory.map(chat => (
                <div key={chat.id} className="relative group">
                <Button
                    variant={activeChatId === chat.id ? "secondary" : "ghost"}
                    className="w-full justify-start pr-8 truncate"
                    onClick={() => switchChat(chat.id)}
                >
                    <MessageSquare className="mr-2" />
                    {chat.title}
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                >
                    <Trash2 className="size-4"/>
                </Button>
                </div>
            ))}
            </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-2">
            <div className="flex items-center justify-between">
                <ThemeToggle />
                <Button asChild variant="ghost" size="icon">
                    <Link href="/settings">
                        <Settings />
                    </Link>
                </Button>
            </div>

            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                        <Trash2 className="mr-2"/>
                        Clear All Chats
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete all your chat history. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllChats}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    </div>
  );


  return (
    <div className="flex h-screen w-full bg-background">
      <aside className="hidden md:flex w-[280px] flex-col border-r">
        <SidebarContent />
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex md:hidden items-center justify-between p-2 border-b">
            <Link href="/" onClick={handleTitleClick} className="flex items-center gap-2 group">
                <TesseractLogo className="size-7" />
                <h1 className="text-md font-semibold tracking-tight font-headline">Tesseract AI</h1>
            </Link>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px]">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </header>

        <main className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full px-4 pt-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    {messages.map((message, index) => (
                        <ChatMessage key={index} message={message} user={null} />
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4">
                            <TesseractLogo className="w-9 h-9 p-1.5 border rounded-full" />
                            <div className="max-w-[75%] rounded-lg border p-3.5 shadow-sm bg-card">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-blink" />
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-blink animation-delay-200" />
                                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-blink animation-delay-400" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>
        </main>
        
        <footer className="p-4 border-t bg-background">
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type your message..."
              className="flex-1 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !input.trim()}
            >
              Send
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
}
