#!/usr/bin/env node

import fs       from 'fs';
import pool     from './lib/db';
import cheerio  from 'cheerio';
import assert   from 'assert';
import * as R   from 'ramda';
import moment   from 'moment';


const MIRROR_LOC = '../siterip/www.killedbypolice.net';
const MAX_YEAR = 2018;
const TOKEN    = '__HAX__';

// Monthly and yearly headers
// November (98)
// # since Jan 1st '14
const isNotHeader = (i,e) => e.children.length === 7;

//
// Note parse_id_date().ids is not really useful except for meta-info
// For my victims and events added retroactively, it's blank
//
const parse_id_date = a => a.reduce( (acc,e) => {
	if ( /reset/.test(e) ) {
		return acc;
	}
	
	let [match,id,date] = e.match(/\s*(?:\((\d+?)\))?\s*(.*)/);
	date = date.replace(/\s+/g, ' ');
	if ( date.length > 0 ) {
		let mdate = moment(date, 'MMMM D, YYYY', true);
		assert.ok(
			acc.date === undefined || mdate.isSame(acc.date),
			`[${e}] dates not eq [acc.date ${acc.date}] [date ${mdate}]`
		);
		assert.ok( mdate.isValid(), `Invalid date ${date}` );
		acc.date = mdate.format('YYYY-MM-DD');
	}

	acc.ids.push(id)
	
	return acc;
}, {ids: [], date:undefined} );

const parse_state = stArr => stArr.reduce(
	(acc,st) => {
		if ( st == 'NJ1' ) { st = 'NJ' }

		assert.ok(st.length === 2, `Invalid state %{st}`);
		assert.ok(
			acc === undefined || acc == st,
			`Different states [a ${acc}, s ${st}]`
		);

		return st;
	}, undefined
);

const aliasRe = /^\s*(?:(?:(?:aka|(?:(?:also|formally|formerly) known as))\s+"?)|")([^"]+)"?$/i;
const innerAliasRe = /(?: known as)?(?:\s+[("])(?:(?:also )?(?:(?:known as)|spelled) )?([^"]+)(?:[")])/i

// Donald S. Ivy Jr., 39   "Dontay"
// Ricky Shawatza Hall, 27, known as "Mya"
const aliasStrip = l => {
	// Jack Snynder, also known as J. Marie Tuck, 63	
	if ( /, also known as ([^,]+?),/.test(l) ) {
		// console.log(l);
		let [r,alias] = l.match(/, also known as ([^,]+?),/);
		let aliasRemoved = l.replace(r,'');
		// console.log("\t" + aliasRemoved);
		// console.log("\t" + alias);
		return [aliasRemoved,alias];
	}
	else if ( innerAliasRe.test(l) ) {
		//console.log(l);
		let [r,alias] = l.match(innerAliasRe);
		let aliasRemoved = l.replace(r,'');
		//console.log("\t" + aliasRemoved);
		//console.log("\t" + alias);
		return [aliasRemoved,alias];
	}
	return [l];
};

const isAlias = str => aliasRe.test(str);
// { names: [], alias: undefined }
const parse_names = namesArr => namesArr.reduce(
	(acc,l,i) => {
		
		// Assumed anyway
		if ( l === 'Separate victim unidentified') { return acc }
		// Victim-to-victim relationships in the name?!?!
		// I'm done hacking this regex.
		l = l.replace(/^her stepfather, /, '');


		// Sometimes second names are just ', aka whatever'
		if ( isAlias(l) ) {
			assert.ok(
				acc.alias === undefined && i === 1,
				`Aliases only handled once ${acc.alias}\n\t[${i}] ${l}`
			);
			acc.alias = l.match(aliasRe)[1];
			//console.dir({l, name:"ALIAS:", acc}, {depth:null});
			return acc;
		}

		let [aliasRemoved, alias] = aliasStrip(l);

		let [, name, age] = aliasRemoved.match(RegExp(
			'^' +
			// name
			'('                      +
				'[^\\d(,]+'            +
				'(?:, (?:Jr.|III?))?'  +
				'(?:, [^\\d(]+)?'      +
			')?'                     +
			'(?:[\\s,.]+)?'          +    //trash 

			// age
			'(' +
				'(?:20s or 30s)|'  + // this is stupid.
				'(?:mid-)?'        + // ..., so is this!
				'(?:'                        +
					'\\d{1,3}s?'               +
					'(?:\\s?-\\s?[\\d]+)?'     + // 20-50
					'(?: *(?:mo\.|months))?'              + // 3 mo.
				')'                          +
			')?'                           +

			'[\\s,.]*'     + // trash

			'$'
		));

		acc.names.push({
			kbp_name_age: l,
			name,
			age,
			alias
		});
		
		return acc;
	},
	{ names: [], alias: undefined }
);

// https://github.com/cheeriojs/cheerio/issues/839
const HAXIFY   = buffer => buffer.toString().replace(/<br>/ig, TOKEN);
const deHAXIFY = $td => $td.text().split(TOKEN).map( R.trim ).filter(e => /\S/.test(e));

const parse_race_sex = rsArr => rsArr.reduce(
	(acc, e, i) => {
		let accElem = { race: undefined, sex: undefined }
		
		e.split('/').forEach( abbr => {
			if ( ! /[A-Za-z]/.test(abbr) ) {
				return;
			}
			switch ( abbr ) {
				case 'M':
					assert.strictEqual(accElem.sex, undefined);
					accElem.sex = 'Male';
					break;
				case 'F':
					assert.strictEqual(accElem.sex, undefined);
					accElem.sex = 'Female';
					break;
				case 'T':
					assert.strictEqual(accElem.sex, undefined);
					accElem.sex = 'Trans';
					break;

				case 'W':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'White'
					break;
				case 'B':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'Black'
					break;
				case 'L':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'Latino'
					break;
				case 'A':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'Asian'
					break;
				case 'PI':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'Pacific Islander'
					break;
				case 'I':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'Immigrant'
					break;
				case 'O':
					assert.strictEqual(accElem.race, undefined);
					accElem.race = 'Other'
					break;
				default:
					console.log(`[Abbreviation ${abbr}] not supported ${e}`)
			}
		} )
		acc.push(accElem);
		return acc;
	}
	, []
);

let causeMap = {
	'G': 'Gun',
	'T': 'Taser',
	'R': 'Restraint/Physical Force',
	'C': 'Chemical',
	'V': 'Vehicle',
	'O': 'Other',
	'.': null
};

for ( let i = 2013; i <=MAX_YEAR; i++ ) {
	const $ = cheerio.load(
		HAXIFY( fs.readFileSync(`${MIRROR_LOC}/kbp${i}.html`) )
	);
	
	$('table[border=1] tr').filter( isNotHeader ).each( (i,tr) => {
		const $name      = $('td:nth-child(4)', tr);
		const name_alias = parse_names(deHAXIFY($name));
		const url_img    = $('a[href]', $name).attr('href');
		const race_sex   = parse_race_sex(deHAXIFY( $('td:nth-child(3)', tr) ));
		const id_date    = parse_id_date( deHAXIFY( $('td:nth-child(1)', tr) ) );
		const state      = parse_state( deHAXIFY( $('td:nth-child(2)', tr) ) );
		let cause        = deHAXIFY( $('td:nth-child(5)', tr) ).reduce( (acc,x) => {
				if ( causeMap[x] !== undefined ) {
					if ( R.not(R.isNil(causeMap[x])) ) {
						acc.push(causeMap[x])
						return acc;
					}
				} else {
					assert.fail(x)
				}
			} , []
		);
		const url_kbpfb  = deHAXIFY( $('td:nth-child(6)', tr) );
		const url_news   = deHAXIFY( $('td:nth-child(7)', tr) );


		// Some people are just described by race_sex
		// assert.ok(
		// 	name_alias.names.length >= race_sex.length,
		// 	`more racey sex than allowed!!!`
		// );

		url_kbpfb.forEach( url => {
			assert.ok( /facebook/.test(url), 'fb_url lacks "facebook"' );
		} );
		
		assert.ok(
			name_alias.alias === undefined || name_alias.names.length === 1,
			`[${id_date.date}] alias for entry with more than one name ${name_alias.alias}`
		);

		if ( R.any(x=>x.length>1)([name_alias.names]) ) {
			//console.dir(
			//	{id_date,state,race_sex,name_alias,cause,url_kbpfb,url_news},
			//	{colors:true, depth:3}
			//);
		}
		const SQL_INSERT = `
		INSERT INTO killedby.kbp_import (
			kbp_id        , kbp_date  ,   kbp_state  , kbp_sex ,    kbp_race   ,
			kbp_name_age  , kbp_name  ,   kbp_age    , kbp_alias ,  kbp_cause  ,
			url_kbpfb     , url_src   ,   url_img
		) VALUES (
			$1,  $2,  $3,  $4,  $5,
			$6,  $7,  $8,  $9,  $10,
			$11, $12, $13
		);`;
		(async function () {
			try {
				for ( let i = 0; i < name_alias.names.length; i++ ) {
					let nameObj      = name_alias.names[i];
					let kbp_name_age = nameObj ? nameObj.kbp_name_age : null;
					let age          = nameObj ? nameObj.age : null;
					let name         = nameObj ? nameObj.name : null;

					let id     = id_date.ids.pop();
					let rs     = race_sex.pop();
					let sex    = rs === undefined ? null : rs.sex;
					let race   = rs === undefined ? null : rs.race;

					const result = await pool.query(SQL_INSERT, [
						id,  id_date.date, state, sex, race,
						kbp_name_age, name, age, nameObj.alias||name_alias.alias, cause,
						url_kbpfb, url_news, url_img
					]);
				}
			}
			catch (e) {
				console.dir({text:$(tr).text(), id_date, name_alias, e}, {depth:null});
			}
		})()

	} );
}
