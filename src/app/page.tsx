
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { Bot, HelpCircle } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-white p-4 text-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <TesseractLogo className="w-32 h-32" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
          Welcome to Tesseract AI
        </h1>
        <div className="max-w-2xl text-lg text-muted-foreground text-center flex flex-col gap-2">
            <p>
            Your personal AI companion for exploring ideas, getting answers, and engaging in creative conversations.
            </p>
        </div>
        <p className="text-md text-muted-foreground">
          Built by <span className="font-semibold animate-blink-blue">Vinit Kumar Yadav</span>.
        </p>
        <p className="text-muted-foreground">Get started by choosing an option below.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 w-full max-w-lg">
          <Button asChild size="lg" className="h-auto py-4 font-headline text-lg shadow-lg hover:shadow-accent/50 transition-shadow flex flex-col gap-2">
            <Link href="/chat">
              <Bot className="w-8 h-8" />
              Start Chatting
            </Link>
          </Button>
           <Button asChild variant="secondary" size="lg" className="h-auto py-4 font-headline text-lg flex flex-col gap-2">
            <Link href="/help">
              <HelpCircle className="w-8 h-8" />
              Help & Tutorial
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
            Your Privacy Matters: All interactions are secure and encrypted.
        </p>
      </div>
    </div>
  );
}
