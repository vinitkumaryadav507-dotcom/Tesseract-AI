
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function ThemeSettings() {
  const { setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">Theme</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Select a theme for the application.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" onClick={() => setTheme('light')}>
            Light
          </Button>
          <Button variant="outline" onClick={() => setTheme('dark')}>
            Dark
          </Button>
          <Button variant="outline" onClick={() => setTheme('cosmic')}>
            Cosmic
          </Button>
        </div>
      </div>
    </div>
  );
}
