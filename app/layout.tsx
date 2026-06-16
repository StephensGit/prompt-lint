import type { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { SettingsDrawer } from '@/features/refine/components/SettingsDrawer';
import { ApiKeyProvider } from '@/lib/api-key-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'PromptLint',
  description: 'A linter for Claude Code prompts',
};

// Applied before paint so the stored theme shows with no flash. Defaults to dark.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, inline no-flash theme script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ApiKeyProvider>
          <Navbar />
          {children}
          <SettingsDrawer />
        </ApiKeyProvider>
      </body>
    </html>
  );
}
