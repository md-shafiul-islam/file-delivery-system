module.exports = {
  async up(knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await knex.schema.createTable('paids', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));

      table.decimal('amount').notNullable();
      table.string('description');
      table.string('method_type').notNullable();
      table.string('status').notNullable();
      table.string('transaction_Id').defaultTo(null);
      table.datetime('transaction_time').defaultTo(knex.fn.now());
      table.uuid('user').references('id').inTable('users').onDelete('CASCADE');

      table.index('user');
      table.index('transaction_Id');
    });
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('paids');
  },
};
