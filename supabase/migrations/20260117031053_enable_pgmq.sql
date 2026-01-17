-- Enable PGMQ extension for Postgres-native message queues
CREATE EXTENSION IF NOT EXISTS pgmq CASCADE;

-- Create job tracking table for all async tasks
CREATE TABLE IF NOT EXISTS job_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  queue_name TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'journalist_enrichment', 'article_scraping', etc.
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  payload JSONB NOT NULL,
  result JSONB,
  error_message TEXT,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_logs_org_id ON job_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_job_logs_status ON job_logs(status);
CREATE INDEX IF NOT EXISTS idx_job_logs_created_at ON job_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_logs_queue_name ON job_logs(queue_name);

-- Enable RLS for multi-tenant security
ALTER TABLE job_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their organization's job logs
CREATE POLICY "Users can view their organization's job logs"
  ON job_logs FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can do everything
CREATE POLICY "Service role has full access to job logs"
  ON job_logs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Create PGMQ queues for different workflows
SELECT pgmq.create('journalist_enrichment');
SELECT pgmq.create('article_enrichment');
SELECT pgmq.create('linkedin_generation');

-- Helper function to enqueue a job
CREATE OR REPLACE FUNCTION enqueue_job(
  p_queue_name TEXT,
  p_job_type TEXT,
  p_organization_id UUID,
  p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_log_id UUID;
  v_msg_id BIGINT;
BEGIN
  -- Create a job log entry
  INSERT INTO job_logs (queue_name, job_type, organization_id, payload, status)
  VALUES (p_queue_name, p_job_type, p_organization_id, p_payload, 'pending')
  RETURNING id INTO v_job_log_id;

  -- Send message to PGMQ queue with the job log ID
  SELECT pgmq.send(
    p_queue_name,
    jsonb_build_object(
      'job_log_id', v_job_log_id,
      'organization_id', p_organization_id,
      'payload', p_payload
    )
  ) INTO v_msg_id;

  RETURN v_job_log_id;
END;
$$;
