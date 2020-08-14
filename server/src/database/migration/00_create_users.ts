import Knex from 'knex';

export async function up(knex: Knex){
	return knex.schema.createTable('users', table =>{
		table.increments('id').primary();
		table.increments('name').notNullable();
		table.increments('avatar').notNullable();
		table.increments('whatsapp').notNullable();
		table.increments('bio').notNullable();
	});
}

export async function down(knex: Knex){
	return knex.schema.dropTable('users');
}