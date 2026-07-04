-- ============================================================
-- MedTrack — Initial Database Schema
-- Uses pg_uuidv7 for time-sortable UUIDs
-- ============================================================

-- Create a pure PL/pgSQL implementation of UUIDv7
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  unix_ts_ms = substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  uuid_bytes = unix_ts_ms || gen_random_bytes(10);
  uuid_bytes = set_byte(uuid_bytes, 6, (b'01110000'::int | (get_byte(uuid_bytes, 6) & b'00001111'::int)));
  uuid_bytes = set_byte(uuid_bytes, 8, (b'10000000'::int | (get_byte(uuid_bytes, 8) & b'00111111'::int)));
  RETURN encode(uuid_bytes, 'hex')::uuid;
END
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================
-- PATIENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  name                text        NOT NULL,
  age                 integer     NOT NULL CHECK (age > 0 AND age < 150),
  gender              text        NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone               text        NOT NULL,
  email               text,
  address             text,
  emergency_contact   text,
  allergies           text[]      DEFAULT '{}',
  chronic_conditions  text[]      DEFAULT '{}',
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  -- Unique constraint: phone number is the primary deduplication key
  CONSTRAINT patients_phone_unique UNIQUE (phone)
);

-- Index for fast name search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients (phone);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients (created_at DESC);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VISITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS visits (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  patient_id      uuid        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date      timestamptz NOT NULL DEFAULT now(),
  visit_type      text        NOT NULL DEFAULT 'checkup' CHECK (visit_type IN ('checkup', 'followup', 'emergency', 'vaccination', 'procedure', 'other')),
  chief_complaint text,
  history_of_present_illness text,
  diagnosis       text,
  prescription    text,
  clinical_notes  text,
  charge          numeric(10,2) NOT NULL DEFAULT 80.00,
  follow_up_date  date,
  follow_up_notes text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits (patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits (visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_follow_up_date ON visits (follow_up_date) WHERE follow_up_date IS NOT NULL;

CREATE TRIGGER visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VITALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS vitals (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v7(),
  visit_id         uuid        NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  blood_pressure   text,         -- e.g. "120/80 mmHg"
  heart_rate       integer CHECK (heart_rate > 0 AND heart_rate < 300),   -- bpm
  temperature      numeric(4,1), -- °C e.g. 37.5
  weight           numeric(5,1), -- kg
  height           numeric(5,1), -- cm
  oxygen_sat       integer CHECK (oxygen_sat >= 0 AND oxygen_sat <= 100),  -- SpO2 %
  respiratory_rate integer CHECK (respiratory_rate > 0 AND respiratory_rate < 100), -- bpm
  blood_sugar      numeric(5,1), -- mg/dL
  blood_sugar_type text CHECK (blood_sugar_type IN ('Fasting', 'Random', 'Postprandial')),
  notes            text,
  recorded_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vitals_visit_id ON vitals (visit_id);

-- ============================================================
-- HELPER VIEW: patients with their last visit date
-- (used by the patients list page)
-- ============================================================
CREATE OR REPLACE VIEW patients_with_last_visit AS
SELECT
  p.*,
  MAX(v.visit_date) AS last_visit_date,
  COUNT(v.id)::integer AS visit_count
FROM patients p
LEFT JOIN visits v ON v.patient_id = p.id
GROUP BY p.id;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- Since this is a local/prototype app without authentication, 
-- we enable RLS but allow all operations for the public (anon) role.

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to visits" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to vitals" ON vitals FOR ALL USING (true) WITH CHECK (true);

-- Grant access to the view for the Supabase API
GRANT SELECT ON patients_with_last_visit TO anon, authenticated;

-- Grant access to the tables for the Supabase API (required if default schema privileges were dropped)
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON visits TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vitals TO anon, authenticated;
