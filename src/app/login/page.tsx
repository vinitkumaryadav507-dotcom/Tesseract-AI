
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TesseractLogo } from '@/components/ui/tesseract-logo';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

function LoginPageContent() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = auth ? useAuth() : { user: null, isUserLoading: true };
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
        toast({
            title: 'Sign In Successful',
            description: 'Welcome back!',
        });
        router.push('/chat');
    }
  }, [user, isUserLoading, router, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      initiateEmailSignIn(auth, values.email, values.password);
      
      // This timeout is a temporary way to handle the non-blocking sign-in.
      // In a real app, you'd listen for onAuthStateChanged to confirm success/failure.
      setTimeout(() => {
        setIsLoading(false);
        // We can't be sure it's an invalid credential here without more complex state management
        // This is a placeholder for user feedback.
        if (!auth.currentUser) {
            toast({
                variant: 'destructive',
                title: 'Sign In Failed',
                description: 'Invalid credentials or network issue. Please try again.',
            });
        }
      }, 3000);

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: 'An unexpected error occurred. Please try again.',
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Link href="/">
              <TesseractLogo className="w-20 h-20" />
            </Link>
          </div>
          <CardTitle className="text-2xl font-headline">SIGN IN</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <FirebaseClientProvider>
      <LoginPageContent />
    </FirebaseClientProvider>
  )
}
