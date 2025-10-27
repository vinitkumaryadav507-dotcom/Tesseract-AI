
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { Bot, History, Plus, Send, Trash2, User, Info } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="relative flex flex-col items-center min-h-screen w-full bg-animated-gradient p-4 text-foreground overflow-y-auto">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-4xl mx-auto py-8">
        <header className="flex flex-col items-center text-center mb-10">
          <TesseractLogo className="w-24 h-24 mb-4" />
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
            Help & Tutorial
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Welcome to Tesseract AI! Here’s a quick guide to get you started and make the most of your AI companion.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-accent" />
                <span>Starting a Conversation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                From the main menu, you can sign in, sign up, or continue as a guest to get to the chat interface.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-md border">
                <Send className="w-5 h-5" />
                <p>Type your message in the input box at the bottom and press Enter or click the Send button.</p>
              </div>
              <p>
                The AI will respond, and your conversation will appear in the main chat window.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="w-6 h-6 text-accent" />
                <span>Managing Chats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>Your conversations are automatically saved in the <span className="font-semibold text-foreground">Chat History</span> panel on the left.</p>
              <div className="flex items-center gap-2 p-3 rounded-md border">
                <Plus className="w-5 h-5" />
                <p>Click <span className="font-semibold text-foreground">"New Chat"</span> to start a new conversation anytime. Your current chat will be saved.</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-md border">
                <Trash2 className="w-5 h-5" />
                <p>Hover over a chat in the history to reveal a delete button. You can also clear all chats with the button at the bottom of the sidebar.</p>
              </div>
            </CardContent>
          </Card>

           <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TesseractLogo className="w-7 h-7" />
                <span>Navigation & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
                 <p>
                Clicking the <span className="font-semibold text-foreground">Tesseract AI</span> logo in the chat sidebar will clear all your locally stored chats and take you back to the main menu. This is a quick way to reset your session.
              </p>
              <p>
                Your privacy is important. If you are logged in, your chats are saved to your account. If you are a guest, conversations are stored locally in your browser and are not persisted on a server. Clearing your browser data will permanently delete your guest chat history.
              </p>
            </CardContent>
          </Card>
        </main>

        <footer className="text-center mt-12">
            <Button asChild size="lg">
                <Link href="/chat">
                    <Bot className="mr-2" /> Got it, let's chat!
                </Link>
            </Button>
        </footer>
      </div>
    </div>
  );
}
