import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://phnbjniebdxwxqcenudj.supabase.co";
const defaultAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobmJqbmllYmR4d3hxY2VudWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDQzMjgsImV4cCI6MjEwNTMyMDMyOH0.Q1Up8LwDWaYoWTXsA6XmzLuB2c0Z6VyiHlTPhnvZ-sA";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] || defaultUrl;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] || defaultAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
