-- FUNCTION: public.get_birddata_tk25(text, integer, integer, period, text, text)

-- DROP FUNCTION public.get_birddata_tk25(text, integer, integer, period, text, text);

CREATE OR REPLACE FUNCTION public.get_birddata_tk25(
	tbl text,
	species integer,
	location integer,
	timesplit period,
	timepoint text,
	year text)
    RETURNS TABLE(id integer, maxbzc integer, geom geometry)
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
	circle_geom
  From
	%s tk,
	ref_govlevel
  Where
	ref_govlevel.govlevel_id=$1
	and
	ST_Intersects(ST_Envelope(geom), tk.grid_geom)
),
query2 as (
   Select
	tk25_id, max(bd.maxbzc) as maxbzc
   From
	%s bd
   Where
	species_id=$2
	and
	time_split=$3
	and
	time_point between $4[1] and $4[2]
    and
	year between $5[1] and $5[2]
  group by tk25_id
)
SELECT CAST(row_number() over () AS int) as id, a.maxbzc, b.circle_geom from query2 a INNER JOIN query1 b ON (a.tk25_id = b.tk25_id)', concat('ref_',tbl), concat('birddata_',tbl));

--RAISE NOTICE '%' , stmt;

RETURN QUERY EXECUTE stmt USING location, species, timesplit, string_to_array(timepoint,',')::int[], string_to_array(year,',')::int[];

END;
$BODY$;

ALTER FUNCTION public.get_birddata_tk25(text, integer, integer, period, text, text)
    OWNER TO regioportal;
