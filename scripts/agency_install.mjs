#!/usr/bin/env node

import {insert}  from './lib/db/agency.mjs'
import assert    from 'assert';
import request   from 'request-promise-native';

(async function () {
	const json = await request({
		url:`https://api.usa.gov/crime/fbi/sapi/api/agencies?api_key=${process.env.API_KEY_DATA_GOV}`,
		json: true
	});

	Object.keys(json).forEach( state => {
		
		Object.keys(json[state]).forEach( async (ori) => {
			const a = json[state][ori];

			// You'd think.. but no.
			// assert.strictEqual( state, ori.slice(0,2), `${state}, ${ori}`);
			// if ( state !== ori.slice(0,2) ) {
			// 	console.log( json[state][ori] );
			// }

			await insert(a);
		} )

	} );

})()
