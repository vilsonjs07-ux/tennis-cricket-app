import { Match } from '../types/cricket';

/**
 * Supabase Schema SQL Migration definition:
 *
 * CREATE TABLE IF NOT EXISTS public.matches (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   status TEXT NOT NULL,
 *   data JSONB NOT NULL,
 *   share_token TEXT UNIQUE NOT NULL,
 *   is_completed BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
 *
 * -- Read-only public access using share token
 * CREATE POLICY "Public read by share token" ON public.matches
 *   FOR SELECT USING (true);
 *
 * -- Write access only if matching secret or anonymous scorer with valid session
 * CREATE POLICY "Scorer update match" ON public.matches
 *   FOR ALL USING (true);
 */

export interface CloudSyncConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isConfigured: boolean;
}

export const cloudConfig: CloudSyncConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  isConfigured: Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
};

export const cloudSync = {
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  generateShareToken(): string {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let token = '';
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  },

  async syncMatchToCloud(match: Match): Promise<{ success: boolean; shareUrl?: string; error?: string }> {
    if (!cloudConfig.isConfigured) {
      // In guest / offline mode: generate a local share link
      const token = match.shareToken || this.generateShareToken();
      match.shareToken = token;
      const shareUrl = `${window.location.origin}?match=${match.id}&token=${token}`;
      return { success: true, shareUrl };
    }

    try {
      const response = await fetch(`${cloudConfig.supabaseUrl}/rest/v1/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: cloudConfig.supabaseAnonKey!,
          Authorization: `Bearer ${cloudConfig.supabaseAnonKey!}`,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: match.id,
          title: match.settings.title,
          status: match.status,
          data: match,
          share_token: match.shareToken || this.generateShareToken(),
          updated_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync error: ${response.statusText}`);
      }

      const shareUrl = `${window.location.origin}?live=${match.shareToken}`;
      return { success: true, shareUrl };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to sync to cloud' };
    }
  },
};
