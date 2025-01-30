exports.up = async function (knex) {
  const hasTable = await knex.schema.hasTable('upload_file');

  if (!hasTable) {
    return knex.schema.createTable('upload_file', (table) => {
      table.increments('id').primary();
      table.string('original_name').notNullable();
      table.integer('version').defaultTo(1);
      table.string('file_key').unique().notNullable();
      table.string('file_url').notNullable();
      table.string('mime_type').notNullable();
      table.boolean('encrypted').defaultTo(false);

      table.timestamps(true, true); // Adds created_at and updated_at columns

      // Add indexes for faster search if necessary

      table.index('original_name');
      table.index('file_key');
    });
  } else {
    console.log('Table "upload_file" already exists, skipping creation.');
  }
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('upload_file');
};
