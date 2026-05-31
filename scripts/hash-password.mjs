// Usage: npm run hash -- 'YourAdminPassword'
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH in .env.
import bcrypt from 'bcryptjs';
const pw = process.argv[2];
if (!pw) { console.error('Usage: npm run hash -- <password>'); process.exit(1); }
console.log(bcrypt.hashSync(pw, 12));
