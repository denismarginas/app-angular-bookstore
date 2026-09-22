const { get, list, put } = require('@vercel/blob');

async function run() {
  const sourceToken = process.env.SOURCE_BLOB_READ_WRITE_TOKEN;
  const destToken = process.env.DEST_BLOB_READ_WRITE_TOKEN;
  const prefix = process.env.MIGRATE_PREFIX || 'books/';

  if (!sourceToken || !destToken) {
    console.error('Set SOURCE_BLOB_READ_WRITE_TOKEN and DEST_BLOB_READ_WRITE_TOKEN before running this script.');
    process.exit(1);
  }

  let cursor;
  let migrated = 0;
  let failed = 0;

  do {
    const { blobs, cursor: nextCursor, hasMore } = await list({
      token: sourceToken,
      prefix,
      cursor
    });

    for (const blob of blobs) {
      const result = await get(blob.pathname, { access: 'private', token: sourceToken });

      if (!result || result.statusCode !== 200) {
        console.error(`Skipped ${blob.pathname}: could not read from the source store`);
        failed += 1;
        continue;
      }

      await put(blob.pathname, result.stream, {
        access: 'public',
        token: destToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: result.blob.contentType || undefined
      });

      migrated += 1;
      console.log(`Migrated ${blob.pathname}`);
    }

    cursor = hasMore ? nextCursor : undefined;
  } while (cursor);

  console.log(`Done. Migrated ${migrated} file(s), ${failed} failed.`);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
