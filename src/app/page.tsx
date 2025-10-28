
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { User, Info, MessageSquare } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-white p-4 text-center overflow-hidden dark:bg-background">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <TesseractLogo className="w-32 h-32" />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground tracking-tight">
          Tesseract AI
        </h1>
        <div className="max-w-2xl text-lg text-muted-foreground text-center flex flex-col gap-2">
            <p>
            Your personal AI companion for exploring ideas, getting answers, and engaging in creative conversations.
            </p>
        </div>
        <p className="text-md text-muted-foreground">
          Built by <span className="font-semibold animate-blink-blue">Vinit Kumar Yadav</span>.
        </p>
        <p className="text-muted-foreground">Get started by entering the chat.</p>
        
        <div className="flex flex-col gap-4 mt-2 w-full max-w-sm">
          <Button asChild size="lg" className="h-auto py-4 font-headline text-lg">
             <Link href="/chat">
                <MessageSquare className="w-8 h-8" />
                Start Chatting
            </Link>
          </Button>
        </div>
        <div className="mt-6">
            <Button asChild variant="link">
                <Link href="/help">
                    <Info className="mr-2" />
                    Help & Tutorial
                </Link>
            </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
            Your Privacy Matters: All interactions are secure and encrypted.
        </p>
      </div>
    </div>
  );
}
