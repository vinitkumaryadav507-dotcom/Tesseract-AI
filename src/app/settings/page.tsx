
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSettings } from '@/components/theme-settings';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="relative flex flex-col items-center min-h-screen w-full bg-background p-4 text-foreground">
      <div className="w-full max-w-4xl mx-auto py-8">
        <header className="flex items-center mb-10">
          <Button asChild variant="ghost" size="icon" className="mr-4">
            <Link href="/chat">
              <ArrowLeft />
              <span className="sr-only">Back to Chat</span>
            </Link>
          </Button>
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Settings
          </h1>
        </header>

        <main className="grid grid-cols-1 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSettings />
            </CardContent>
          </Card>
          
          {/* Add other settings cards here in the future */}
        </main>
      </div>
    </div>
  );
}
