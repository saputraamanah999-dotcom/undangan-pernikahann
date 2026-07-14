// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://tvgofqfksbjuzdxzukud.supabase.co";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2Z29mcWZrc2JqdXpkeHp1a3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMzkyNjQsImV4cCI6MjA5ODgxNTI2NH0.73jUhRje9uhMuZfM1aNQIwBasmv9C0uUdYi9RVfr6_0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
