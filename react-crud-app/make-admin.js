import pg from 'pg';

const { Client } = pg;

// Сіздің тіркелген телефон нөміріңізді осында жазыңыз
const phoneToMakeAdmin = process.argv[2];

if (!phoneToMakeAdmin) {
    console.log("Қате: Телефон нөмірін жазуды ұмытпаңыз!");
    console.log("Қолдану үлгісі: node make-admin.js 87001234567");
    process.exit(1);
}

const client = new Client({
    // Render-дегі сыртқы (External) база сілтемесі
    connectionString: "postgresql://dbweb_itrq_user:wtoVURDRWCBLnea1w42qjHKKiT3k23XA@dpg-d7p33be7r5hc73f74vj0-a.singapore-postgres.render.com/dbweb_itrq",
    ssl: { rejectUnauthorized: false }
});

async function makeAdmin() {
    try {
        await client.connect();
        const res = await client.query(
            "UPDATE users SET role = 'admin' WHERE phone = $1 RETURNING id, name, phone, role",
            [phoneToMakeAdmin]
        );

        if (res.rowCount === 0) {
            console.log(`❌ "${phoneToMakeAdmin}" нөмірімен тіркелген қолданушы табылмады.`);
            console.log("Алдымен сайтқа кіріп, осы нөмірмен тіркеліңіз.");
        } else {
            const user = res.rows[0];
            console.log(`✅ Құттықтаймыз! ${user.name} (${user.phone}) енді админ болды.`);
        }
    } catch (err) {
        console.error("Қате шықты:", err);
    } finally {
        await client.end();
    }
}

makeAdmin();
