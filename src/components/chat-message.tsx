
"use client"

import { Bot, User, Copy, ThumbsUp, ThumbsDown, Lightbulb, Target, Laugh } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { TesseractLogo } from "./ui/tesseract-logo";
import type { User as FirebaseUser } from "firebase/auth";

interface ChatMessageProps {
  message: Message;
  user: FirebaseUser | null;
}

export function ChatMessage({ message, user }: ChatMessageProps) {
  const { toast } = useToast();
  const { role, content } = message;
  const isUser = role === 'user';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard!",
    });
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "G";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <div className={cn("flex items-start gap-4", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="w-9 h-9 border">
            <TesseractLogo className="w-9 h-9 p-1.5" />
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-lg border p-3.5 shadow-sm",
          isUser
            ? "bg-accent text-accent-foreground"
            : "bg-card"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-current prose-p:my-0">
           <p className="whitespace-pre-wrap">{content}</p>
        </div>
        {!isUser && content && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(content)}>
                <Copy className="w-4 h-4" />
                <span className="sr-only">Copy</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ThumbsUp className="w-4 h-4" />
                <span className="sr-only">Like</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ThumbsDown className="w-4 h-4" />
                <span className="sr-only">Dislike</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Lightbulb className="w-4 h-4" />
                <span className="sr-only">Insightful</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Target className="w-4 h-4" />
                <span className="sr-only">On Target</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Laugh className="w-4 h-4" />
                <span className="sr-only">Funny</span>
              </Button>
            </div>
          </>
        )}
      </div>
      {isUser && (
        <Avatar className="w-9 h-9">
          <AvatarFallback>
            {user?.isAnonymous || !user?.displayName ? (
                <User className="w-5 h-5" />
            ) : (
                getInitials(user.displayName)
            )}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

