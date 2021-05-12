-- FUNCTION: public.get_sightings_tk25(text, integer, period, text, text)

-- DROP FUNCTION public.get_sightings_tk25(text, integer, period, text, text);

CREATE OR REPLACE FUNCTION public.get_sightings_tk25(
	tbl text,
	location integer,
	timesplit period,
	timepoint text,
	year text)
    RETURNS TABLE(id integer, numrec integer, geom geometry)
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
    ROWS 1000
AS $BODY$
DECLARE
stmt TEXT;

BEGIN

stmt = format('WITH query1 as (
  Select
	tk25_id,
	grid_geom
  From
	%s tk,
	ref_govlevel
  Where
	ref_govlevel.govlevel_id=$1
	and
	ST_Intersects(geom, tk.grid_geom)
  --ST_Intersects(ST_Envelope(geom), tk.grid_geom)
  --ST_Contains(ST_MakeEnvelope(bbox[3], bbox[4], bbox[1], bbox[2], 4326), tk.grid_geom)--
),
query2 as (
   Select
	tk25_id, sum(sg.numrecords)::int as numrec
   From
	%s sg
   Where
	time_split=$2
	and
	time_point between $3[1] and $3[2]
  and
	year between $4[1] and $4[2]
  group by tk25_id
)
SELECT CAST(row_number() over () AS int) as id, a.numrec, b.grid_geom from query2 a RIGHT JOIN query1 b ON (a.tk25_id = b.tk25_id)', concat('ref_',tbl), concat('sightings_',tbl));
--RIGHT JOIN: returns all rows from the right table, even if there are no matches in the left table

--RAISE NOTICE '%' , stmt;

RETURN QUERY EXECUTE stmt USING location, timesplit, string_to_array(timepoint,',')::int[], string_to_array(year,',')::int[];

END;
$BODY$;

ALTER FUNCTION public.get_sightings_tk25(text, integer, period, text, text)
    OWNER TO regioportal;
