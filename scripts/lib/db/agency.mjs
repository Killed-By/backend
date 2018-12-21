import pool from '../db';

const SQL_INSERT = `
INSERT INTO fbi.agencies (
	agency_ori          ,
	agency_name         ,
	agency_type_name    ,
	agency_state_name   ,
	agency_state_abbr   ,
	agency_divison_name ,
	agency_region_name  ,
	agency_region_desc  ,
	agency_county_name  ,
	agency_nibrs        ,
	geog
) VALUES (
	$1, $2, $3, $4, $5,
	$6, $7, $8, $9, $10,
	ST_MakePoint($11, $12)
);`;

export async function insert (a) {
	try {
		await pool.query(SQL_INSERT, [
			a.ori           , a.agency_name  , a.agency_type_name  , a.state_name   , a.state_abbr   ,
			a.division_name , a.region_name  , a.reigion_desc      , a.county_name  , a.nibrs        ,
			a.longitude     , a.latitude
		]);
	} catch (e) {
		console.log(e);
	}
	return;
}

