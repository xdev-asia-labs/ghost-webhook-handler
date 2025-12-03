import dotenv from 'dotenv';
import { initDatabase, createUser } from './db.js';
import { hashPassword } from './auth.js';

dotenv.config();

async function createDefaultAdmin() {
    try {
        console.log('🔧 Initializing database...');
        await initDatabase();

        console.log('👤 Creating default admin user...');
        const password = await hashPassword('admin123');

        try {
            await createUser('admin', password);
            console.log('✅ Admin user created successfully!');
            console.log('\n📝 Login credentials:');
            console.log('   Username: admin');
            console.log('   Password: admin123');
            console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
        } catch (error) {
            if (error.message.includes('Duplicate')) {
                console.log('ℹ️  Admin user already exists');
            } else {
                throw error;
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createDefaultAdmin();
