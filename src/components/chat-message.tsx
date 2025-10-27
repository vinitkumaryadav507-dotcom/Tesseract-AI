"use client"

import { Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typewriter } from "@/components/ui/typewriter";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { TesseractLogo } from "./ui/tesseract-logo";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { toast } = useToast();
  const { role, content } = message;
  const isUser = role === 'user';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard!",
    });
  };

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
            ? "bg-primary text-primary-foreground"
            : "bg-card"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground prose-p:my-0">
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <Typewriter text={content} />
          )}
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
            </div>
          </>
        )}
      </div>
      {isUser && (
        <Avatar className="w-9 h-9">
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
