import { Injectable, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  private readonly readyPromise: Promise<void>;

  constructor(private readonly supabase: SupabaseService) {
    this.readyPromise = this.supabase.client.auth
      .getSession()
      .then(({ data }) => {
        this.session.set(data.session);
      });

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
    });
  }

  waitUntilReady(): Promise<void> {
    return this.readyPromise;
  }

  signUp(email: string, password: string) {
    return this.supabase.client.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.client.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.client.auth.signOut();
  }
}
