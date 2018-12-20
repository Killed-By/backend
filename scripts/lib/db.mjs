import pg from 'pg';

// https://github.com/brianc/node-postgres/issues/16
const pool = new pg.Pool({
	host: '/var/run/postgresql',
});

export default pool;
