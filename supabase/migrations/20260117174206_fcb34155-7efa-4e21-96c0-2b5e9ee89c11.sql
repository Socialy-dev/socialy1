DROP FUNCTION IF EXISTS public.pgmq_read(TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.pgmq_read(
  p_queue_name TEXT,
  p_vt INTEGER,
  p_qty INTEGER
)
RETURNS TABLE (
  msg_id BIGINT,
  read_ct INTEGER,
  enqueued_at TIMESTAMPTZ,
  vt TIMESTAMPTZ,
  message JSONB,
  headers JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.enqueued_at, r.vt, r.message, r.headers
  FROM pgmq.read(p_queue_name, p_vt, p_qty, '{}'::jsonb) r;
END;
$$;