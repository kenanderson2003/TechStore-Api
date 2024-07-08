const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db.js'); // Importando la conexión de db.js

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Endpoints de productos
app.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, categoriaId, stock, imagen } = req.body;
  const query = 'INSERT INTO productos (nombre, descripcion, precio, categoriaId, stock, imagen) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [nombre, descripcion, precio, categoriaId, stock, imagen], (error, results) => {
    if (error) throw error;
    res.send('Producto creado!');
  });
});

app.get('/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM productos WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.json(results[0]);
  });
});

app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoriaId, stock, imagen } = req.body;
  const query = 'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, categoriaId = ?, stock = ?, imagen = ? WHERE id = ?';
  connection.query(query, [nombre, descripcion, precio, categoriaId, stock, imagen, id], (error, results) => {
    if (error) throw error;
    res.send('Producto actualizado!');
  });
});

app.delete('/productos/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM productos WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.send('Producto eliminado!');
  });
});

// Endpoints de clientes
app.post('/clientes', (req, res) => {
  const { nombre, email, telefono, direccionEnvio } = req.body;
  const query = 'INSERT INTO clientes (nombre, email, telefono, direccionEnvio) VALUES (?, ?, ?, ?)';
  connection.query(query, [nombre, email, telefono, direccionEnvio], (error, results) => {
    if (error) throw error;
    res.send('Cliente creado!');
  });
});

app.get('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM clientes WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.json(results[0]);
  });
});

app.put('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, direccionEnvio } = req.body;
  const query = 'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, direccionEnvio = ? WHERE id = ?';
  connection.query(query, [nombre, email, telefono, direccionEnvio, id], (error, results) => {
    if (error) throw error;
    res.send('Cliente actualizado!');
  });
});

app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM clientes WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.send('Cliente eliminado!');
  });
});

app.post('/ordenes', async (req, res) => {
    const { clienteId, productos, total, estado } = req.body;
    console.log('Datos recibidos:', req.body);
  
    try {
      // Inserta la orden en la tabla `ordenes`
      const queryOrden = 'INSERT INTO ordenes (clienteId, total, estado) VALUES (?, ?, ?)';
      const [result] = await connection.promise().execute(queryOrden, [clienteId, total, estado]);
      const ordenId = result.insertId;
      console.log('Orden insertada con ID:', ordenId);
  
      // Verificar existencia de productos
      const productosIds = productos.map(producto => producto.productoId);
      const [productosExistentes] = await connection.promise().query('SELECT id FROM productos WHERE id IN (?)', [productosIds]);
      const productosExistentesIds = productosExistentes.map(producto => producto.id);
  
      const productosNoExistentes = productosIds.filter(id => !productosExistentesIds.includes(id));
      if (productosNoExistentes.length > 0) {
        console.error('Productos no existentes:', productosNoExistentes);
        return res.status(400).send('Uno o más productos no existen');
      }
  
      // Construye los valores para insertar en `ordenes_productos`
      const productosValues = productos.map(producto => [ordenId, producto.productoId, producto.cantidad]);
      console.log('Valores para insertar en ordenes_productos:', productosValues);
  
      // Inserta los productos en la tabla `ordenes_productos`
      const queryProductos = 'INSERT INTO ordenes_productos (ordenId, productoId, cantidad) VALUES ?';
      await connection.promise().query(queryProductos, [productosValues]);
  
      res.send('Orden creada exitosamente');
    } catch (error) {
      console.error('Error al insertar los productos de la orden:', error);
      res.status(500).send('Error al crear los productos de la orden');
    }
  });
  
app.get('/ordenes/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT o.id, o.total, o.estado, c.nombre AS cliente, GROUP_CONCAT(p.nombre SEPARATOR ', ') AS productos
    FROM ordenes o
    JOIN clientes c ON o.clienteId = c.id
    JOIN ordenes_productos op ON o.id = op.ordenId
    JOIN productos p ON op.productoId = p.id
    WHERE o.id = ?
    GROUP BY o.id, o.total, o.estado, c.nombre
  `;
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.json(results[0]);
  });
});

app.put('/ordenes/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const query = 'UPDATE ordenes SET estado = ? WHERE id = ?';
  connection.query(query, [estado, id], (error, results) => {
    if (error) throw error;
    res.send('Estado de la orden actualizado!');
  });
});

app.delete('/ordenes/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM ordenes WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.send('Orden eliminada!');
  });
});

// Endpoints de categorías
app.post('/categorias', (req, res) => {
  const { nombre, descripcion } = req.body;
  const query = 'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)';
  connection.query(query, [nombre, descripcion], (error, results) => {
    if (error) throw error;
    res.send('Categoría creada!');
  });
});

app.get('/categorias', (req, res) => {
  const query = 'SELECT * FROM categorias';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.put('/categorias/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  const query = 'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?';
  connection.query(query, [nombre, descripcion, id], (error, results) => {
    if (error) throw error;
    res.send('Categoría actualizada!');
  });
});

app.delete('/categorias/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM categorias WHERE id = ?';
  connection.query(query, [id], (error, results) => {
    if (error) throw error;
    res.send('Categoría eliminada!');
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
