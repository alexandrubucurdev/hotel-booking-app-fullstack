-- 1. Enum pentru statusul rezervării
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- 2. Tabela pentru tipurile de camere și inventarul total (Hardcoded conform cerinței)
CREATE TABLE room_types (
  id TEXT PRIMARY KEY, -- ex: 'matrimoniala', 'twin'
  name TEXT NOT NULL,
  price_per_night INTEGER NOT NULL, -- preț în RON
  total_inventory INTEGER NOT NULL DEFAULT 20
);

-- Populăm inventarul inițial
INSERT INTO room_types (id, name, price_per_night, total_inventory) VALUES
('matrimoniala', 'Camera Matrimonială', 300, 20),
('twin', 'Camera Twin', 300, 20),
('tripla', 'Camera Triplă', 400, 20),
('cvadrupla', 'Camera Cvadruplă', 500, 20);

-- 3. Tabela pentru Rezervări
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
  deposit_paid INTEGER NOT NULL, -- cei 50%
  stripe_session_id TEXT UNIQUE,
  status booking_status DEFAULT 'pending'
);

-- Index pentru căutări rapide de disponibilitate
CREATE INDEX idx_bookings_dates ON bookings (check_in, check_out, status);

-- 4. Funcție RPC (Remote Procedure Call) pentru verificarea disponibilității
-- Aceasta rulează direct în DB pentru performanță maximă
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
      AND b.status IN ('confirmed', 'pending') -- Luăm în calcul și cele pending (în curs de plată)
      AND b.check_in < check_out_date
      AND b.check_out > check_in_date
    ) as available_count
  FROM room_types rt;
END;
$$ LANGUAGE plpgsql;