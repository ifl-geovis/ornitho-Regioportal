CREATE OR REPLACE FUNCTION public.get_species(
	val integer[])
    RETURNS SETOF jsonb
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
    ROWS 1000
AS $BODY$
BEGIN

RETURN QUERY
SELECT jsonb_build_object(
    'results', jsonb_agg(query.feature)
)
FROM (
  SELECT jsonb_build_object(
    'id', species_id,
    'text', name_german,
    'pm', syst_sorting
  ) AS feature
  FROM (Select species_id, name_german, syst_sorting from ref_species where syst_sorting = ANY (val) order by name_german) row) query;

END;
$BODY$;

ALTER FUNCTION public.get_species(integer[])
    OWNER TO regioportal;
