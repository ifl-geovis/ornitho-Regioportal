-- FUNCTION: public.get_govlevelnames(character varying[], character varying)

-- DROP FUNCTION public.get_govlevelnames(character varying[], character varying);

CREATE OR REPLACE FUNCTION public.get_govlevelnames(
	val character varying[],
	qstr character varying)
    RETURNS SETOF jsonb
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
    ROWS 1000
AS $BODY$
BEGIN

RETURN QUERY

WITH query1 as (
  SELECT jsonb_build_object(
    'text', val[1],
    'children', jsonb_agg(row)
  ) AS feature
  FROM (Select govlevel_id as id, name as text, bbox as value, hmf from ref_govlevel where category in (val[1]) and name ilike '%' || qstr || '%' order by name) row
),
query2 as (
  SELECT jsonb_build_object(
    'text', val[2],
    'children', jsonb_agg(row)
  ) AS feature
  FROM (Select govlevel_id as id, name as text, bbox as value, hmf from ref_govlevel where category in (val[2]) and name ilike '%' || qstr || '%' order by name) row
),
query3 as (
  SELECT jsonb_build_object(
    'text', val[3],
    'children', jsonb_agg(row)
  ) AS feature
  FROM (Select govlevel_id as id, name as text, bbox as value, hmf from ref_govlevel where category in (val[3]) and name ilike '%' || qstr || '%' order by name) row
),
ctable as (
    select 1,feature from query1
        union
    select 2,feature from query2
        union
    select 3,feature from query3
	order by 1
)
SELECT jsonb_build_object(
    'results', jsonb_agg(ctable.feature)
)
FROM ctable
WHERE (feature->>'children') IS NOT NULL;

END;
$BODY$;

ALTER FUNCTION public.get_govlevelnames(character varying[], character varying)
    OWNER TO regioportal;
