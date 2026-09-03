import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private supabase: SupabaseClient;
  private session = new BehaviorSubject<Session | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    
    this.supabase.auth.getSession().then(({ data }) => {
      this.session.next(data.session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.session.next(session);
    });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  get currentSession(): Session | null {
    return this.session.value;
  }
}
