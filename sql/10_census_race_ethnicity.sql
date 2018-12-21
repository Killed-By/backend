--
-- May not be the best idea, but race/ethnicity come from census.
-- https://www.census.gov/newsroom/press-releases/2018/2020-race-questions.html
--
CREATE SCHEMA census;

CREATE TYPE census.race AS ENUM (
	'American Indian or Alaska Native',
	'Asian',
	'Black or African American',
	'Native Hawaiian or Other PacificIslander',
	'White'
);

CREATE TYPE census.ethnicity AS ENUM (
	'Hispanic or Latino',
	'Not Hispanic or Latino'
);
