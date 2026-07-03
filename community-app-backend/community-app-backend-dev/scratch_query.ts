import { dbPool } from "./src/config/db";

async function run() {
  try {
    const [tables] = await dbPool.query("SHOW TABLES");
    console.log("=== TABLES ===");
    const tablesList = (tables as any[]).map(t => Object.values(t)[0]);
    console.log(tablesList.join("\n"));
    
    const importantTables = [
      "tbl_member_profile", 
      "tbl_logins", 
      "tbl_community_member_relation", 
      "tbl_families", 
      "tbl_community"
    ];

    for (const t of importantTables) {
      if (tablesList.includes(t)) {
        console.log(`\n=== DESCRIBE ${t} ===`);
        const [desc] = await dbPool.query(`DESCRIBE ${t}`);
        console.table(desc);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}
run();
