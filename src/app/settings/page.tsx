
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSettings } from '@/components/theme-settings';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { user } = useUser();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'G';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

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

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  This is how Tesseract AI sees you. Keep it updated to get the
                  best experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-2xl">
                      <UserIcon className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      Guest
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">Novice</p>
                        <p className="text-sm text-muted-foreground">Level</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">0</p>
                        <p className="text-sm text-muted-foreground">Streak</p>
                    </div>
                </div>

                <div>
                    <Label>Daily Goal</Label>
                    <Progress value={40} className="mt-2" />
                </div>
                 <div>
                    <Label>Weekly Engagement</Label>
                    <Progress value={60} className="mt-2" />
                </div>
                 <div>
                  <Label className="mb-2 block">Interest Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Tech</Badge>
                    <Badge variant="secondary">Sports</Badge>
                    <Badge variant="secondary">Music</Badge>
                    <Badge variant="secondary">Art</Badge>
                    <Badge variant="secondary">Travel</Badge>
                    <Badge variant="outline">+ Add</Badge>
                  </div>
                </div>
                 <div className="space-y-6 pt-4">
                    <div>
                        <Label htmlFor="humor-slider">Humor: <span className="text-muted-foreground font-normal">Serious to Funny</span></Label>
                        <Slider id="humor-slider" defaultValue={[50]} max={100} step={1} className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="detail-slider">Detail: <span className="text-muted-foreground font-normal">Concise to Detailed</span></Label>
                        <Slider id="detail-slider" defaultValue={[75]} max={100} step={1} className="mt-2" />
                    </div>
                     <div>
                        <Label htmlFor="style-slider">Style: <span className="text-muted-foreground font-normal">Professional to Casual</span></Label>
                        <Slider id="style-slider" defaultValue={[60]} max={100} step={1} className="mt-2" />
                    </div>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of the application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSettings />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
