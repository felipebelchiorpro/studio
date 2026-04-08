import { pb } from '../src/lib/pocketbaseAdmin';

async function checkSchema() {
  try {
    const adminPb = await pb();
    const collection = await adminPb.collections.getOne('products');
    console.log("Collection type:", collection.type);
    console.log("Fields:");
    collection.schema.forEach((s: any) => console.log(` - ${s.name} (${s.type})`));
  } catch (e: any) {
    console.log("Error", e.message, e.data);
  }
}

checkSchema();
