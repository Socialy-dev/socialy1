CREATE OR REPLACE FUNCTION public.pgmq_read(
    p_queue_name TEXT,
    p_vt INTEGER,
    p_qty INTEGER
)
RETURNS TABLE(msg_id BIGINT, read_ct INTEGER, enqueued_at TIMESTAMPTZ, vt TIMESTAMPTZ, message JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY SELECT * FROM pgmq.read(p_queue_name, p_vt, p_qty);
END;
$$;

CREATE OR REPLACE FUNCTION public.pgmq_archive(
    p_queue_name TEXT,
    p_msg_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN pgmq.archive(p_queue_name, p_msg_id);
END;
$$;