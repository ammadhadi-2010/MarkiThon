require('dotenv').config();
const sequelize = require('../config/database');
const { purgeDuplicateProducts } = require('../utils/purgeDuplicateProducts');

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    await sequelize.authenticate();
    const result = await purgeDuplicateProducts({ dryRun });
    console.log(JSON.stringify(result, null, 2));
    await sequelize.close();
}

main().catch(async (error) => {
    console.error(error.message || error);
    try { await sequelize.close(); } catch (err) { /* ignore */ }
    process.exit(1);
});
