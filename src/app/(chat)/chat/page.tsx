
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, History, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatMessage } from '@/components/chat-message';
import { Avatar } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Message, ChatSession } from '@/lib/types';
import { chat } from '@/ai/flows/chat';
import { autoNameChat } from '@/ai/flows/auto-name-chat';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const activeChat = chats.find(c => c.id === activeChatId);

  const handleNewChat = useCallback(() => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, []);

  useEffect(() => {
    if (isInitialLoadComplete) return;
    try {
      const savedChats = localStorage.getItem('tesseract-chats');
      if (savedChats) {
        const parsedChats: ChatSession[] = JSON.parse(savedChats);
        if (parsedChats.length > 0) {
          setChats(parsedChats);
          setActiveChatId(parsedChats[0].id);
        } else {
          handleNewChat();
        }
      } else {
        handleNewChat();
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load chat history. Starting a new session." });
      handleNewChat();
    } finally {
        setIsInitialLoadComplete(true);
    }
  }, [handleNewChat, toast, isInitialLoadComplete]);

  useEffect(() => {
    if (!isInitialLoadComplete) return;
    if (chats.length > 0) {
      try {
        localStorage.setItem('tesseract-chats', JSON.stringify(chats));
      } catch (error) {
        console.error("Failed to save chats:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not save chat history." });
      }
    } else if (localStorage.getItem('tesseract-chats')) {
      localStorage.removeItem('tesseract-chats');
    }
  }, [chats, toast, isInitialLoadComplete]);
  
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [activeChat?.messages]);

  const handleDeleteChat = (e: React.MouseEvent, chatIdToDelete: string) => {
    e.stopPropagation();
    setChats(prev => {
      const remainingChats = prev.filter(c => c.id !== chatIdToDelete);
      if (activeChatId === chatIdToDelete) {
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          // This will trigger the effect below to create a new chat
          setActiveChatId(null); 
        }
      }
      return remainingChats;
    });
  };

  const handleClearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
  };

  // Effect to create a new chat if all are deleted.
  useEffect(() => {
    if (isInitialLoadComplete && chats.length === 0 && activeChatId === null) {
      handleNewChat();
    }
  }, [chats, activeChatId, handleNewChat, isInitialLoadComplete]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !activeChatId) return;
    
    const currentChat = activeChat;
    if (!currentChat) {
      console.error("handleSendMessage called with no active chat. This should not happen.");
      toast({ variant: "destructive", title: "Application Error", description: "No active chat session. Please refresh." });
      return;
    }
    const currentChatId = activeChatId;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...currentChat.messages, userMessage];

    setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: updatedMessages } : c));
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (currentChat.messages.length === 0) {
      autoNameChat(currentInput)
        .then(newTitle => {
          setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title: newTitle } : c));
        })
        .catch(err => console.error("Error auto-naming chat:", err));
    }

    try {
      const aiResponse = await chat({
        history: currentChat.messages.map(m => ({ role: m.role, content: m.content })),
        message: currentInput,
      });
      const modelMessage: Message = { role: 'model', content: aiResponse };
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...updatedMessages, modelMessage] } : c));
    } catch (error) {
      console.error("Error with AI chat:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to get AI response." });
      const errorMessage: Message = { role: 'model', content: 'Sorry, I ran into an error. Please try again.' };
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...updatedMessages, errorMessage] } : c));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialLoadComplete) {
    return (
        <div className="flex h-dvh w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }

  return (
    <div className="flex h-dvh w-full">
      <aside className="hidden md:flex w-[280px] flex-col border-r bg-muted/20 p-2">
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <TesseractLogo className="w-8 h-8" />
                <h1 className="text-xl font-headline font-semibold tracking-tight">Tesseract AI</h1>
            </div>
            <ThemeToggle />
        </div>
        <Separator className="my-2" />
        <Button onClick={handleNewChat} className="mb-2">
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground px-2 py-1">
          <History className="w-4 h-4"/>
          <span>Chat History</span>
        </div>
        <ScrollArea className="flex-1 mt-2 -mr-2">
          <div className="flex flex-col gap-1 pr-2">
            {chats.map(c => (
              <div key={c.id} className="group relative">
                <Button
                  variant={activeChatId === c.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => setActiveChatId(c.id)}
                >
                  <div className="flex flex-col w-full overflow-hidden">
                    <span className="truncate font-medium">{c.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      <span className="sr-only">Delete chat</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>This action will permanently delete the chat "{c.title}".</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={(e) => handleDeleteChat(e, c.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </ScrollArea>
        <Separator className="mt-2" />
         <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete all chat history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAllChats}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </aside>

      <main className="flex-1 flex flex-col h-dvh">
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <TesseractLogo className="w-20 h-20 mb-4" />
                <h2 className="text-3xl font-headline font-semibold">How can I help you today?</h2>
              </div>
            ) : (
              activeChat.messages.map((m, i) => <ChatMessage key={`${activeChat.id}-${i}`} message={m} />)
            )}
            {isLoading && <div className="flex items-start gap-4">
              <Avatar className="w-9 h-9 border">
                <TesseractLogo className="w-9 h-9 p-1.5" />
              </Avatar>
              <div className="max-w-[75%] rounded-lg border bg-card p-3.5 shadow-sm flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>}
          </div>
        </div>
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Tesseract AI..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
              <span className="sr-only">Send Message</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
