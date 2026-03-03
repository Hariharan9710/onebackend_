// import { pool } from './modules/admin/config/db.js';
// import bcrypt from 'bcryptjs';

// async function check() {
//     try {
//         const [rows] = await pool.query('SELECT username, email, password, role FROM users WHERE email = ?', ['admin1@gmail.com']);
//         if (rows.length === 0) {
//             console.log('User not found');
//             return;
//         }
//         const user = rows[0];
//         console.log('User found:', user.username, user.email, user.role);

//         // Check if password looks like a bcrypt hash
//         if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
//             console.log('Password is a bcrypt hash');
//         } else {
//             console.log('Password is NOT a bcrypt hash:', user.password);
//         }

//         // Test common passwords if it's a hash
//         const common = ['admin', 'admin123', 'password', 'welcome'];
//         for (const p of common) {
//             const match = await bcrypt.compare(p, user.password);
//             if (match) {
//                 console.log('MATCH FOUND! Password is:', p);
//                 break;
//             }
//         }
//     } catch (err) {
//         console.error(err);
//     } finally {
//         process.exit();
//     }
// }

// check();
