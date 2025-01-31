export async function up(knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('user_name').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('type').defaultTo(true);
    table.boolean('active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_name');
    table.index('email');
  });

  await knex.schema.createTable('agent', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').references('id').inTable('chats').onDelete('CASCADE');
    table.boolean('active').defaultTo(false);
    table.boolean('availabile').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('agent');
}
