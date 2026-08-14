-- KrishiBundle Database Schema
-- Run this in your Supabase SQL Editor to set up all required tables, indexes, and realtime subscriptions.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Profiles Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'driver', 'admin')),
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ta', 'te', 'ml', 'hi')),
    fcm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow select & upsert for all authenticated users/anon for simplicity of testing)
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for all users" ON public.profiles FOR ALL USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Orders Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('KB' || floor(random() * (9999 - 1000 + 1) + 1000)::text),
    farmer_phone TEXT NOT NULL REFERENCES public.profiles(phone) ON DELETE CASCADE,
    farmer_name TEXT NOT NULL,
    crop TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CREATED',
    fare_offer NUMERIC NOT NULL DEFAULT 380,
    current_fare NUMERIC,
    assigned_driver TEXT REFERENCES public.profiles(phone) ON DELETE SET NULL,
    raw_transcript TEXT,
    confidence NUMERIC NOT NULL DEFAULT 100,
    pickup_lat NUMERIC DEFAULT 11.0168,
    pickup_lng NUMERIC DEFAULT 76.9558,
    destination_lat NUMERIC DEFAULT 13.0732,
    destination_lng NUMERIC DEFAULT 80.1979,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for all users" ON public.orders FOR ALL USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Bids Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    driver_phone TEXT NOT NULL REFERENCES public.profiles(phone) ON DELETE CASCADE,
    driver_name TEXT NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'Tata Ace',
    amount NUMERIC NOT NULL,
    reliability NUMERIC DEFAULT 95,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for all users" ON public.bids FOR ALL USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Trips Table
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    driver_phone TEXT NOT NULL REFERENCES public.profiles(phone) ON DELETE CASCADE,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED')),
    pickup_sequence INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Enable insert/update for all users" ON public.trips FOR ALL USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Enable Realtime for crucial tables
-- ─────────────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.bids;
alter publication supabase_realtime add table public.trips;
