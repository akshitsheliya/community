import { scanCommunityForMatches } from './src/services/familyMatcherService';
import { dbPool } from './src/config/db';

async function run() {
  try {
    const result = await scanCommunityForMatches(1);
    console.log("Scan Result:", result);

    const [rows]: any = await dbPool.query("SELECT * FROM tbl_family_match_suggestions ORDER BY created_at DESC LIMIT 5");
    console.log("Latest suggestions:");
    console.table(rows.map((r: any) => ({
      member_a: r.member_id_a,
      member_b: r.member_id_b,
      label: r.suggested_label,
      score: r.match_score,
      reason: r.match_reason
    })));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}
run();
