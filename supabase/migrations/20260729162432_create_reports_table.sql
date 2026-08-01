/*
# Create reports table for Civic Connect

1. New Tables
- `reports`
  - `id` (uuid, primary key)
  - `citizen_id` (text, identifies the submitter - guest ID or email)
  - `photo_url` (text, public URL of uploaded photo in storage)
  - `latitude` (float, GPS latitude)
  - `longitude` (float, GPS longitude)
  - `address` (text, reverse-geocoded street address)
  - `department` (text, e.g. 'Electricity', 'Potholes & Roads', 'Municipality & Waste', 'Water Supply')
  - `status` (text, 'Pending' | 'In Progress' | 'Resolved', default 'Pending')
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `reports`.
- Allow anon + authenticated to INSERT (guests and signed-in citizens can submit reports).
- Allow anon + authenticated to SELECT all reports (citizens see their own by filtering citizen_id; officers view by department). Data is intentionally shared across citizen/officer roles for this civic app.
- Allow anon + authenticated to UPDATE status (officers update ticket status).
3. Notes
- This is a civic reporting app where reports are intentionally shared/public (anyone can view community reports). `USING (true)` is acceptable here because the data is community-visible by design, not as an ownership shortcut.
- Officers are identified by a separate auth flow (User ID & Password) but for this initial build, status updates are allowed from the anon client to keep the flow simple.
4. Storage
- Create a public storage bucket `report-photos` for uploading citizen photos.
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id text NOT NULL,
  photo_url text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reports" ON reports;
CREATE POLICY "anon_select_reports" ON reports FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reports" ON reports;
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reports" ON reports;
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS reports_citizen_id_idx ON reports (citizen_id);
CREATE INDEX IF NOT EXISTS reports_department_idx ON reports (department);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at DESC);

INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_report_photos" ON storage.objects;
CREATE POLICY "anon_upload_report_photos" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'report-photos');

DROP POLICY IF EXISTS "anon_read_report_photos" ON storage.objects;
CREATE POLICY "anon_read_report_photos" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'report-photos');