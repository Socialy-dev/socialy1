CREATE TABLE IF NOT EXISTS public.job_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_name TEXT NOT NULL,
    job_type TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_logs_status ON public.job_logs(status);
CREATE INDEX IF NOT EXISTS idx_job_logs_queue_name ON public.job_logs(queue_name);
CREATE INDEX IF NOT EXISTS idx_job_logs_organization_id ON public.job_logs(organization_id);

ALTER TABLE public.job_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all job logs"
ON public.job_logs FOR SELECT
USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Organization members can view their job logs"
ON public.job_logs FOR SELECT
USING (public.user_belongs_to_org(organization_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.enqueue_job(
    p_queue_name TEXT,
    p_job_type TEXT,
    p_organization_id UUID,
    p_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_job_log_id UUID;
BEGIN
    INSERT INTO public.job_logs (queue_name, job_type, organization_id, payload, status)
    VALUES (p_queue_name, p_job_type, p_organization_id, p_payload, 'pending')
    RETURNING id INTO v_job_log_id;

    PERFORM pgmq.send(
        p_queue_name,
        jsonb_build_object(
            'job_log_id', v_job_log_id,
            'organization_id', p_organization_id,
            'payload', p_payload
        )
    );

    RETURN v_job_log_id;
END;
$$;