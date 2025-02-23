module.exports = {
  async up(knex) {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await knex.schema.createTable('chats', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('customer_id').notNullable();
      table.uuid('agent_id').nullable();
      table.boolean('active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('customer_id');
      table.index('agent_id');
    });

    await knex.schema.createTable('messages', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .uuid('chat_id')
        .references('id')
        .inTable('chats')
        .onDelete('CASCADE');
      table.string('sender_id').notNullable();
      table.text('content').notNullable();
      table.text('file_url').notNullable();
      table.text('file_name').notNullable();
      table.text('file_type').notNullable();
      table.text('file_key').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.index('chat_id');
      table.index('sender_id');
    });
  },

  async down(knex) {
    await knex.schema.dropTableIfExists('messages');
    await knex.schema.dropTableIfExists('chats');
  },
};
