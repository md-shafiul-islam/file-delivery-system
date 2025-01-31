module.exports = {
  async up(knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await knex.schema.createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable();
      table.string('user_name').notNullable();
      table.string('email').notNullable();
      table.string('password').notNullable();
      table.boolean('active').defaultTo(true);
      table
        .enum('role', ['admin', 'agent', 'customer'])
        .notNullable()
        .defaultTo('customer');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('user_name');
      table.index('email');
    });

    await knex.schema.createTable('agent', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user').references('id').inTable('users').onDelete('CASCADE');
      table.string('name').notNullable();
      table.boolean('active').defaultTo(false);
      table.boolean('availabile').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('agent');
  },
};
