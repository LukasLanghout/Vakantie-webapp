-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location_lat FLOAT,
  location_lng FLOAT,
  hotel_name TEXT,
  hotel_lat FLOAT,
  hotel_lng FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Group members (many-to-many)
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT,
  price_label TEXT,
  price_value INT DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  needs_reservation BOOLEAN DEFAULT FALSE,
  opening_hours TEXT,
  duration TEXT,
  travel_time TEXT,
  description TEXT,
  lat FLOAT,
  lng FLOAT,
  tiktok_url TEXT,
  tiktok_creator TEXT,
  day_number INT,
  scheduled_time TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity wishlist
CREATE TABLE IF NOT EXISTS activity_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(activity_id, user_id)
);

-- Indexes
CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_groups_trip ON groups(trip_id);
CREATE INDEX idx_groups_code ON groups(share_code);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_activities_trip ON activities(trip_id);
CREATE INDEX idx_activities_day ON activities(trip_id, day_number);
CREATE INDEX idx_activities_creator ON activities(added_by);
CREATE INDEX idx_wishlist_activity ON activity_wishlist(activity_id);
CREATE INDEX idx_wishlist_user ON activity_wishlist(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_wishlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can see own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies: Users can see trips they own
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT
  USING (auth.uid() = owner_id);

-- RLS Policies: Users can insert own trips
CREATE POLICY "Users can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies: Users can update own trips
CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE
  USING (auth.uid() = owner_id);

-- RLS Policies: Users can delete own trips
CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies: Groups - users can see groups of their trips
CREATE POLICY "Users can view groups in their trips"
  ON groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = groups.trip_id AND trips.owner_id = auth.uid()));

-- RLS Policies: Groups - users can create groups in their trips
CREATE POLICY "Users can create groups in their trips"
  ON groups FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.owner_id = auth.uid()));

-- RLS Policies: Activities - users can see activities in their trips
CREATE POLICY "Users can view activities in their trips"
  ON activities FOR SELECT
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = activities.trip_id AND trips.owner_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM group_members gm
               JOIN groups g ON gm.group_id = g.id
               WHERE g.trip_id = activities.trip_id AND gm.user_id = auth.uid());

-- RLS Policies: Activities - users can create activities in their trips
CREATE POLICY "Users can create activities in their trips"
  ON activities FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.owner_id = auth.uid()));

-- RLS Policies: Activities - users can update activities in their trips
CREATE POLICY "Users can update activities in their trips"
  ON activities FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_id AND trips.owner_id = auth.uid()));

-- RLS Policies: Group members - can see members in groups they belong to
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM group_members WHERE group_members.group_id = group_id));
