-- 1. Resetare (Opțional, dacă ai creat deja tabelele și vrei să le refaci curat)
DROP FUNCTION IF EXISTS check_availability;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_types;
DROP TYPE IF EXISTS booking_status;

-- 2. Enum pentru statusul rezervării
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- 3. Tabela pentru tipurile de camere
CREATE TABLE room_types (
  id TEXT PRIMARY KEY, -- Acesta TREBUIE să fie identic cu cel din rooms.ts
  name TEXT NOT NULL,
  price_per_night INTEGER NOT NULL, -- Prețul trebuie să fie sursa de adevăr
  total_inventory INTEGER NOT NULL DEFAULT 5 -- Setează câte camere fizice ai de fiecare tip
);

-- 4. Populăm datele EXACT ca în lib/data/rooms.ts
INSERT INTO room_types (id, name, price_per_night, total_inventory) VALUES
('camera-matrimoniala', 'Camera Matrimonială', 140, 5),
('camera-dubla-twin', 'Camera Dublă Twin', 140, 5),
('camera-tripla', 'Camera Triplă', 180, 3),
('camera-cvadrupla', 'Camera Cvadruplă', 150, 2);

-- 5. Tabela pentru Rezervări
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  room_type_id TEXT REFERENCES room_types(id),
  
  -- Date Client
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  special_requests TEXT,
  
  -- Date Plată
  total_price INTEGER NOT NULL,
  deposit_paid INTEGER NOT NULL, -- 50%
  stripe_session_id TEXT UNIQUE,
  status booking_status DEFAULT 'pending'
);

-- Index pentru performanță la căutare
CREATE INDEX idx_bookings_dates ON bookings (check_in, check_out, status);

-- 6. Funcția RPC pentru verificarea disponibilității
CREATE OR REPLACE FUNCTION check_availability(
  check_in_date DATE,
  check_out_date DATE
)
RETURNS TABLE (
  room_type_id TEXT,
  available_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rt.id,
    rt.total_inventory - (
      SELECT COUNT(*)
      FROM bookings b
      WHERE b.room_type_id = rt.id
      AND b.status IN ('confirmed', 'pending') -- Numărăm și cele în curs de plată
      AND b.check_in < check_out_date  -- Se suprapun datele
      AND b.check_out > check_in_date
    ) as available_count
  FROM room_types rt;
END;
$$ LANGUAGE plpgsql;