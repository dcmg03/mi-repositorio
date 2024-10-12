const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  const plainPassword = '12345';  // Reemplaza por la contraseña deseada
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  console.log(hashedPassword);  // Este será el hash de la contraseña que usarás
}

generatePasswordHash();
