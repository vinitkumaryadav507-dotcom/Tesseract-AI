
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Plus, History, Trash2, Loader2, LogOut, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatMessage } from '@/components/chat-message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Message, ChatSession } from '@/lib/types';
import { chat } from '@/ai/flows/chat';
import { autoNameChat } from '@/ai/flows/auto-name-chat';
import { User as UserIcon } from 'lucide-react';

export default function ChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  
  const activeChat = chats.find(c => c.id === activeChatId);
  
  // Handle Guest Login
  useEffect(() => {
    const isGuest = searchParams.get('guest');
    if (isGuest && !user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [searchParams, user, isUserLoading, auth]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user && !searchParams.get('guest')) {
      router.push('/');
    }
  }, [isUserLoading, user, router, searchParams]);


  const getStorageKey = useCallback(() => {
    if (!user) return null;
    return `tesseract-chats-${user.uid}`;
  }, [user]);

  const handleNewChat = useCallback((existingChats: ChatSession[] = []) => {
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const updatedChats = [newChat, ...existingChats];
    setChats(updatedChats);
    setActiveChatId(newChat.id);
    return updatedChats;
  }, []);

  useEffect(() => {
    if (!user || isInitialLoadComplete) return;

    const storageKey = getStorageKey();
    if (!storageKey) return;

    let loadedChats: ChatSession[] = [];
    try {
      const savedChats = localStorage.getItem(storageKey);
      if (savedChats) {
        loadedChats = JSON.parse(savedChats);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load chat history. Starting a new session." });
    }
    
    if (loadedChats.length === 0) {
      handleNewChat([]);
    } else {
      setChats(loadedChats);
      setActiveChatId(loadedChats[0].id);
    }
    setIsInitialLoadComplete(true);

  }, [user, isInitialLoadComplete, handleNewChat, getStorageKey, toast]);

  useEffect(() => {
    if (!isInitialLoadComplete || !user) return;
    const storageKey = getStorageKey();
    if (!storageKey) return;

    try {
      if (chats.length === 0) {
        localStorage.removeItem(storageKey);
        return;
      }
      
      const chatsToSave = chats.filter(c => c.messages.length > 0 || c.title !== 'New Chat');
      if (chatsToSave.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(chatsToSave));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Failed to save chats:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save chat history." });
    }
  }, [chats, isInitialLoadComplete, user, getStorageKey, toast]);
  
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
          setActiveChatId(null);
          handleNewChat([]);
        }
      }
      return remainingChats;
    });
  };

  const handleClearAllChats = () => {
    setChats([]);
    setActiveChatId(null);
    const storageKey = getStorageKey();
    if (storageKey) {
        localStorage.removeItem(storageKey);
    }
    handleNewChat([]);
  };

  const handleTitleClick = () => {
    const storageKey = getStorageKey();
    if(storageKey) {
        localStorage.removeItem(storageKey);
    }
    setChats([]);
    setActiveChatId(null);
  };
  
  const handleSignOut = async () => {
    await auth.signOut();
    handleTitleClick(); // clear local state
    router.push('/');
  }

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

    try {
      if (currentChat.messages.length === 0 && !user?.isAnonymous) {
        autoNameChat(currentInput)
          .then(newTitle => {
            setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, title: newTitle } : c));
          })
          .catch(err => console.error("Error auto-naming chat:", err));
      }

      const aiResponse = await chat({
        history: currentChat.messages.map(m => ({ role: m.role, content: m.content })),
        message: currentInput,
      });
      const modelMessage: Message = { role: 'model', content: aiResponse };
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...updatedMessages, modelMessage] } : c));
    } catch (error) {
      console.error("Error with AI chat:", error);
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I ran into an error. Please try again.";
      toast({ variant: "destructive", title: "Error", description: "Failed to get AI response." });
      const errorMessage: Message = { role: 'model', content: errorMessageContent };
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...updatedMessages, errorMessage] } : c));
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || !isInitialLoadComplete) {
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
          <Link href="/" onClick={handleTitleClick} className="flex items-center gap-2 group">
            <TesseractLogo className="w-8 h-8 group-hover:animate-pulse" />
            <h1 className="text-xl font-headline font-semibold tracking-tight group-hover:text-accent">Tesseract AI</h1>
          </Link>
          <ThemeToggle />
        </div>
        <Separator className="my-2" />
        <Button onClick={() => handleNewChat(chats)} className="mb-2">
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
        <div className="space-y-2 mt-2">
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </Button>
            <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full" disabled={chats.length === 0 || (chats.length === 1 && chats[0]?.messages.length === 0)}>
                <Trash2 className="mr-2 h-4 w-4" /> Clear History
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will permanently delete all chat history. This action cannot be undone.
                </AlertDialogDescription>
                </Header>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllChats}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-dvh">
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <TesseractLogo className="w-20 h-20 mb-4" />
                <h2 className="text-3xl font-headline font-semibold">How can I help you today, {user?.isAnonymous ? 'Guest' : user?.displayName || 'there'}?</h2>
              </div>
            ) : (
              activeChat.messages.map((m, i) => <ChatMessage key={`${activeChat.id}-${i}`} message={m} user={user} />)
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
