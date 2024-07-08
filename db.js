const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'KEN200308', // Reemplaza con tu contraseña de MySQL
  database: 'techstore'
});

connection.connect(error => {
  if (error) throw error;
  console.log('Database connected!');
});

module.exports = connection;
