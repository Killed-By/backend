CREATE TYPE kbp_gender AS ENUM (
	'Male',
	'Female',
	'Trans'
);

CREATE TYPE kbp_race AS ENUM (
	'White',
	'Black',
	'Latino',
	'Asian',
	'Pacific Islander',
	'Immigrant',
	'Other'
);

CREATE TYPE kbp_cause AS ENUM (
	'Gun',
	'Taser',
	'Restraint/Physical Force',
 	'Chemical',
	'Vehicle',
	'Other'
);

CREATE TABLE kbp_import (
	id           int       PRIMARY KEY
		GENERATED BY DEFAULT AS IDENTITY,
	
	kbp_id            smallint,
	kbp_date          date,
	kbp_state         char(2),
	kbp_gender        kbp_gender,
	kbp_race          kbp_race,

	kbp_name_age text,
	kbp_name     text,
	kbp_age      text,
	kbp_alias    text,

	kbp_cause    kbp_cause[],
	url_kbpfb    text[],
	url_src      text[],
	url_img      text
);