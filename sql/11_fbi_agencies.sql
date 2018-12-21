-- Data source from API
-- See https://opendata.stackexchange.com/q/13659/13983
-- We can expand though with more meta data, https://github.com/fbi-cde/crime-data-api/blob/9b49b5cc3cd8309dda888f49356ee5168c43851a/dba/after_load/cde_states.sql
CREATE SCHEMA fbi;

CREATE TABLE fbi.agencies (
	agency_ori          char(9)  PRIMARY KEY,
	agency_name         text,
	agency_type_name    text,
	agency_state_name   text,
	agency_state_abbr   char(2),
	agency_divison_name text,
	agency_region_name  text,
	agency_region_desc  text,
	agency_county_name  text,
	agency_nibrs        bool,
	geog                geography
);
COMMENT ON TABLE fbi.agencies IS $$Downloaded from Crime Data API End Point$$;
COMMENT ON COLUMN fbi.agencies.agency_ori          IS 'Original name in JSON from API: ori';
COMMENT ON COLUMN fbi.agencies.agency_name         IS 'Original name in JSON from API: agency_name';
COMMENT ON COLUMN fbi.agencies.agency_type_name    IS 'Original name in JSON from API: agency_type_name';
COMMENT ON COLUMN fbi.agencies.agency_state_name   IS 'Original name in JSON from API: state_name';
COMMENT ON COLUMN fbi.agencies.agency_state_abbr   IS 'Original name in JSON from API: state_abbr';
COMMENT ON COLUMN fbi.agencies.agency_divison_name IS 'Original name in JSON from API: division_name';
COMMENT ON COLUMN fbi.agencies.agency_region_name  IS 'Original name in JSON from API: region_name';
COMMENT ON COLUMN fbi.agencies.agency_region_desc  IS 'Original name in JSON from API: region_desc';
COMMENT ON COLUMN fbi.agencies.agency_county_name  IS 'Original name in JSON from API: county_name';
COMMENT ON COLUMN fbi.agencies.agency_nibrs        IS 'Original name in JSON from API: nibrs';
COMMENT ON COLUMN fbi.agencies.geog                IS 'Original name in JSON from API: latitude AND longitude';
