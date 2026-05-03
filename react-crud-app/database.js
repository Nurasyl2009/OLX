import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

// TIMESTAMP (without timezone) бағандарын UTC ретінде оқу (Уақыт белдеуі қатесін жөндеу)
pg.types.setTypeParser(1114, str => new Date(str + 'Z'));
// Railway DATABASE_URL немесе жергілікті .env қолдайды
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    })
  : new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });

pool.on('error', (err, client) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  // Do NOT call process.exit — let the server keep running
});

export const query = (text, params) => pool.query(text, params);

export const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'buyer'
      );
    `);

    await client.query('ALTER TABLE Users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT \'buyer\'');
    await client.query('ALTER TABLE Users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE');
    await client.query('ALTER TABLE Users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE');
    await client.query('ALTER TABLE Users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS Products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        seller_id INT NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        CONSTRAINT fk_seller
          FOREIGN KEY (seller_id) 
          REFERENCES Users(id)
          ON DELETE CASCADE
      );
    `);

    await client.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'available\'');
    await client.query('ALTER TABLE Products ADD COLUMN IF NOT EXISTS views INT DEFAULT 0');

    await client.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='user_id') THEN
          ALTER TABLE Products RENAME COLUMN user_id TO seller_id;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='name') THEN
          ALTER TABLE Products RENAME COLUMN name TO title;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        buyer_id INT NOT NULL,
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product
          FOREIGN KEY (product_id) 
          REFERENCES products(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_buyer
          FOREIGN KEY (buyer_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);
    try {
      await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    } catch (err) {
      console.log('ordered_at might already exist or table is missing');
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(255) NOT NULL,
        user_id INT,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) DEFAULT '',
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add title column to notifications if missing
    try {
      await client.query('ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT \'\'');
    } catch (err) {}

    // Messages table for chat system
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_requests (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT');
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 100000');
      await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT \'Басқа\'');
    } catch (err) {}

    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);

    await client.query('COMMIT');
    console.log('Database tables successfully initialized!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to initialize database tables:', e);
  } finally {
    client.release();
  }
};
