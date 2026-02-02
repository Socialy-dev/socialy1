CREATE OR REPLACE FUNCTION public.pop_from_queue(p_queue_name text)
RETURNS TABLE(id uuid, payload jsonb, organization_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_job_id UUID;
    v_payload JSONB;
    v_org_id UUID;
BEGIN
    UPDATE public.job_queue AS jq
    SET 
        status = 'processing',
        processing_started_at = now(),
        updated_at = now()
    WHERE jq.id = (
        SELECT jq2.id
        FROM public.job_queue AS jq2
        WHERE jq2.status = 'pending'
        AND jq2.queue_name = p_queue_name
        ORDER BY jq2.priority DESC, jq2.created_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
    )
    RETURNING jq.id, jq.payload, jq.organization_id
    INTO v_job_id, v_payload, v_org_id;

    IF v_job_id IS NOT NULL THEN
        RETURN QUERY SELECT v_job_id, v_payload, v_org_id;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.push_to_queue(p_queue_name text, p_payload jsonb, p_org_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_job_id UUID;
BEGIN
    INSERT INTO public.job_queue (queue_name, payload, organization_id)
    VALUES (p_queue_name, p_payload, p_org_id)
    RETURNING id INTO v_job_id;
    
    RETURN v_job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_job(p_job_id uuid, p_result jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.job_queue
    SET 
        status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = p_job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_job(p_job_id uuid, p_error text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.job_queue
    SET 
        status = CASE 
            WHEN retry_count < max_retries THEN 'pending'
            ELSE 'failed' 
        END,
        error_message = p_error,
        retry_count = retry_count + 1,
        updated_at = now(),
        processing_started_at = NULL
    WHERE id = p_job_id;
END;
$$;