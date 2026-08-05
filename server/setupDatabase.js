const pool = require('./config/db'); // Make sure this path matches your actual db config file

const createLedgersTable = async () => {
    try {
        console.log('🛠️ Checking if ledgers table exists...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ledgers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                retailer_id INT NOT NULL,
                order_id INT DEFAULT NULL,
                type ENUM('debit', 'credit') NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                description VARCHAR(255) DEFAULT NULL,
                date DATE DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (retailer_id) REFERENCES retailers(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ ledgers table created successfully! (or it already existed)');
        process.exit(0); // Exit the script successfully

    } catch (error) {
        console.error('❌ Error creating ledgers table:', error.message);
        process.exit(1); // Exit the script with failure
    }
};

createLedgersTable();