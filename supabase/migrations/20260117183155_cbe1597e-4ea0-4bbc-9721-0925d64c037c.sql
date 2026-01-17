UPDATE journalists 
SET 
  notes = NULL
WHERE notes LIKE '%Enriched via Apify%' 
   OR notes LIKE '%Location: [object Object]%'
   OR notes LIKE '%No LinkedIn profile found%';

UPDATE journalists 
SET email = NULL
WHERE email LIKE '{%' OR email LIKE '{"email"%';