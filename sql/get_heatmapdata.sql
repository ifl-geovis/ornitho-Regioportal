-- FUNCTION: public.get_heatmapdata(text, period, text, text)

-- DROP FUNCTION public.get_heatmapdata(text, period, text, text);

CREATE OR REPLACE FUNCTION public.get_heatmapdata(
	tbl text,
	timesplit period,
	timepoint text,
	year text)
    RETURNS SETOF jsonb
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
    ROWS 1000
AS $BODY$
DECLARE stmt TEXT;

BEGIN

stmt = format('Select to_jsonb(
    feat
)
FROM (
    WITH query1 as (
      Select
    	tk25_id,
    	round(cast (ST_X(point_geom) as numeric),3) as lon, round(cast (ST_Y(point_geom) as numeric),3) as lat
      From
    	%s tk
    ),
    query2 as (
      Select
    	tk25_id,
	    count(distinct species_id) as num
      From
    	%s bd
      Where
      	time_split=$1
   	 	and
      	time_point between $2[1] and $2[2]
      	and
   	 	year between $3[1] and $3[2]
   		and
		species_id not in (select species_id from ref_species where syst_sorting in (1,99))
     Group by tk25_id
    )
    SELECT ARRAY_agg(Array[b.lat,b.lon,a.num]) as heatmap from query2 a RIGHT JOIN query1 b ON (a.tk25_id = b.tk25_id)) feat', concat('ref_',tbl), concat('birddata_',tbl));

  --RAISE NOTICE '%' , stmt;

  RETURN QUERY EXECUTE stmt USING timesplit, string_to_array(timepoint,',')::int[], string_to_array(year,',')::int[];

  END;
$BODY$;

ALTER FUNCTION public.get_heatmapdata(text, period, text, text)
    OWNER TO regioportal;
