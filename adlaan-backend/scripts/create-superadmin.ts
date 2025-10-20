import * as bcrypt from 'bcrypt';

async function hashPassword() {
  const password = 'tt55oo77';
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  console.log('Hashed Password:', hashedPassword);
  console.log('\nSQL Query:');
  console.log(`
INSERT INTO "user" (name, email, password, role) 
VALUES (
  'husain',
  'al-hussein@papayatrading.com',
  '${hashedPassword}',
  'SUPER_ADMIN'
)
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  name = EXCLUDED.name;
  `);
}

hashPassword();
