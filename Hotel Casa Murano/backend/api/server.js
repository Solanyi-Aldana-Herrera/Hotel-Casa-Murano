const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/frontend', express.static(path.join(__dirname, '..', '..', 'frontend')));

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'db_hotel',
    port: 3306});

conexion.connect((error) => {
    if (error) {
        console.error('Error al conectar MySQL:', error);
        return;
    }

    console.log('MySQL conectado correctamente');
});

app.get('/', (req, res) => {
    res.send('API Hotel Casa Murano funcionando');
});

app.post('/login', (req, res) => {

    const { usuario, contrasena } = req.body;

    const sql = `
        SELECT *
        FROM administrador
        WHERE usuario = ?
        AND contrasena = ?
    `;

    conexion.query(
        sql,
        [usuario, contrasena],
        (error, resultados) => {

            if (error) {
                return res.status(500).json({
                    success: false,
                    mensaje: 'Error del servidor'
                });
            }

            if (resultados.length > 0) {

                return res.json({
                    success: true,
                    mensaje: 'Bienvenido'
                });

            } else {

                return res.json({
                    success: false,
                    mensaje: 'Usuario o contraseña incorrectos'
                });

            }
        }
    );
});



// =========================================================================
// CONFIGURACIÓN DEL CONFIGURADOR DE CORREOS (NODEMAILER)
// =========================================================================
const transportador = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    }
});

// =========================================================================
// RUTA DE RECUPERACIÓN — GENERA TOKEN Y ENVÍA ENLACE POR CORREO
// =========================================================================
app.post('/recuperar-contrasena', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, mensaje: 'El correo es requerido.' });
    }

    const sqlBuscar = 'SELECT id FROM administrador WHERE correo = ?';

    conexion.query(sqlBuscar, [email], (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ success: false, mensaje: 'Error de base de datos' });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({ success: false, mensaje: 'El correo electrónico no está registrado.' });
        }

        const adminId = resultados[0].id;
        const token = crypto.randomBytes(32).toString('hex');
        const expiracion = new Date(Date.now() + 600000);

        const sqlGuardarToken = 'UPDATE administrador SET token_recuperacion = ?, expiracion_token = ? WHERE id = ?';

        conexion.query(sqlGuardarToken, [token, expiracion, adminId], (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ success: false, mensaje: 'Error al generar el enlace de recuperación.' });
            }

            const linkRecuperacion = `http://localhost:3000/frontend/pages/restablecer.html?token=${token}`;

            const opcionesCorreo = {
                from: `Hotel Casa Murano <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Restablecer Contraseña - Hotel Casa Murano',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                        <h2 style="color: #333; text-align: center;">Hotel Casa Murano</h2>
                        <p>Hola, has solicitado restablecer tu contraseña de administrador.</p>
                        <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${linkRecuperacion}" style="background-color: #12cbc4; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px;">Restablecer Contraseña</a>
                        </div>
                        <p style="color: #666; font-size: 12px;">Este enlace expirará en 10 minutos.</p>
                        <p style="color: #666; font-size: 12px;">Si tú no solicitaste este cambio, ignora este correo.</p>
                    </div>
                `
            };

            transportador.sendMail(opcionesCorreo, (errInfo, info) => {
                if (errInfo) {
                    console.error('Error al enviar el correo:', errInfo);
                    return res.status(500).json({ success: false, mensaje: 'No se pudo enviar el correo electrónico.' });
                }

                console.log(`Correo enviado a: ${email}`);
                return res.json({ 
                    success: true, 
                    mensaje: 'El enlace de recuperación ha sido enviado a tu correo electrónico.' 
                });
            });
        });
    });
});

// =========================================================================
// VALIDAR TOKEN — Verifica que el token sea válido y no haya expirado
// =========================================================================
app.post('/validar-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, mensaje: 'Token requerido.' });
    }

    const sql = 'SELECT id, expiracion_token FROM administrador WHERE token_recuperacion = ?';

    conexion.query(sql, [token], (error, resultados) => {
        if (error) {
            return res.status(500).json({ success: false, mensaje: 'Error del servidor.' });
        }

        if (resultados.length === 0) {
            return res.status(400).json({ success: false, mensaje: 'El enlace de recuperación no es válido.' });
        }

        const ahora = new Date();
        const expiracion = new Date(resultados[0].expiracion_token);

        if (ahora > expiracion) {
            return res.status(400).json({ success: false, mensaje: 'El enlace de recuperación ha expirado.' });
        }

        return res.json({ success: true, mensaje: 'Token válido.' });
    });
});

// =========================================================================
// ACTUALIZAR CLAVE — Usa token para verificar y actualizar la contraseña
// =========================================================================
app.post('/actualizar-clave-directa', (req, res) => {
    const { token, contrasena } = req.body;

    if (!token || !contrasena) {
        return res.status(400).json({ success: false, mensaje: 'Token y contraseña son requeridos.' });
    }

    if (contrasena.length < 4) {
        return res.status(400).json({ success: false, mensaje: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    const sqlVerificar = 'SELECT id, expiracion_token FROM administrador WHERE token_recuperacion = ?';

    conexion.query(sqlVerificar, [token], (error, resultados) => {
        if (error) {
            return res.status(500).json({ success: false, mensaje: 'Error del servidor.' });
        }

        if (resultados.length === 0) {
            return res.status(400).json({ success: false, mensaje: 'El enlace de recuperación no es válido.' });
        }

        const ahora = new Date();
        const expiracion = new Date(resultados[0].expiracion_token);

        if (ahora > expiracion) {
            return res.status(400).json({ success: false, mensaje: 'El enlace de recuperación ha expirado.' });
        }

        const adminId = resultados[0].id;
        const sqlActualizar = 'UPDATE administrador SET contrasena = ?, token_recuperacion = NULL, expiracion_token = NULL WHERE id = ?';

        conexion.query(sqlActualizar, [contrasena, adminId], (error) => {
            if (error) {
                return res.status(500).json({ success: false, mensaje: 'Error al cambiar la contraseña.' });
            }
            return res.json({ success: true, mensaje: 'Contraseña actualizada correctamente.' });
        });
    });
});

// =========================================================================
// MULTER — CONFIGURACIÓN DE SUBIDA DE IMÁGENES
// =========================================================================

const rutaImagenes = path.join(__dirname, '..', '..', 'frontend', 'images', 'contenido');

if (!fs.existsSync(rutaImagenes)) {
    fs.mkdirSync(rutaImagenes, { recursive: true });
}

const almacenamiento = multer.diskStorage({
    destination: (req, file, cb) => cb(null, rutaImagenes),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, nombre);
    }
});

const upload = multer({ storage: almacenamiento });

// POST /api/upload — Subir imagen (DEBE ir antes de /api/:tabla)
app.post('/api/upload', upload.single('imagen'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, mensaje: 'No se envió ninguna imagen' });
    const rutaRelativa = '/frontend/images/contenido/' + req.file.filename;
    res.json({ success: true, ruta: rutaRelativa, nombre: req.file.filename });
});

// =========================================================================
// API CRUD — RUTAS DINÁMICAS PARA TODAS LAS TABLAS
// =========================================================================

const TABLAS = {
    bienvenida:           { insertar: ['titulo','subtitulo','descripcion','despedida','imagen'] },
    galeria:              { insertar: ['titulo','imagen'] },
    habitaciones:         { insertar: ['nombre','descripcion','precio','imagen','capacidad','estado'] },
    iconos_nosotros:      { insertar: ['nombre','icono','descripcion'] },
    informacion_contacto: { insertar: ['direccion','celular','email','mapa_iframe'] },
    mensajes_contacto:    { insertar: ['nombre','correo','telefono','asunto','mensaje','leido'] },
    nosotros:             { insertar: ['titulo','descripcion','imagen'] },
    servicios:            { insertar: ['nombre','descripcion','imagen'] },
    slider_inicio:        { insertar: ['titulo','descripcion','imagen','orden_slider','activo'] }
};

// GET /api/:tabla — Listar todos los registros
app.get('/api/:tabla', (req, res) => {
    const { tabla } = req.params;
    if (!TABLAS[tabla]) return res.status(400).json({ success: false, mensaje: 'Tabla no válida' });

    conexion.query(`SELECT * FROM \`${tabla}\``, (error, resultados) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al consultar', error });
        res.json({ success: true, datos: resultados });
    });
});

// GET /api/:tabla/:id — Obtener un registro
app.get('/api/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    if (!TABLAS[tabla]) return res.status(400).json({ success: false, mensaje: 'Tabla no válida' });

    conexion.query(`SELECT * FROM \`${tabla}\` WHERE id = ?`, [id], (error, resultados) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al consultar', error });
        if (resultados.length === 0) return res.status(404).json({ success: false, mensaje: 'No encontrado' });
        res.json({ success: true, dato: resultados[0] });
    });
});

// POST /api/:tabla — Crear un registro
app.post('/api/:tabla', (req, res) => {
    const { tabla } = req.params;
    const config = TABLAS[tabla];
    if (!config) return res.status(400).json({ success: false, mensaje: 'Tabla no válida' });

    const columnas = config.insertar.filter(col => req.body[col] !== undefined);
    const valores = columnas.map(col => req.body[col]);
    const placeholders = columnas.map(() => '?').join(', ');

    const sql = `INSERT INTO \`${tabla}\` (${columnas.join(', ')}) VALUES (${placeholders})`;

    conexion.query(sql, valores, (error, resultado) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al insertar', error });
        res.json({ success: true, mensaje: 'Registro creado', id: resultado.insertId });
    });
});

// PUT /api/:tabla/:id — Actualizar un registro
app.put('/api/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    const config = TABLAS[tabla];
    if (!config) return res.status(400).json({ success: false, mensaje: 'Tabla no válida' });

    const columnas = config.insertar.filter(col => req.body[col] !== undefined);
    const valores = columnas.map(col => req.body[col]);

    if (columnas.length === 0) return res.status(400).json({ success: false, mensaje: 'Sin datos para actualizar' });

    const sets = columnas.map(col => `\`${col}\` = ?`).join(', ');
    const sql = `UPDATE \`${tabla}\` SET ${sets} WHERE id = ?`;

    conexion.query(sql, [...valores, id], (error, resultado) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al actualizar', error });
        res.json({ success: true, mensaje: 'Registro actualizado' });
    });
});

// DELETE /api/:tabla/:id — Eliminar un registro
app.delete('/api/:tabla/:id', (req, res) => {
    const { tabla, id } = req.params;
    if (!TABLAS[tabla]) return res.status(400).json({ success: false, mensaje: 'Tabla no válida' });

    conexion.query(`DELETE FROM \`${tabla}\` WHERE id = ?`, [id], (error, resultado) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al eliminar', error });
        if (resultado.affectedRows === 0) return res.status(404).json({ success: false, mensaje: 'No encontrado' });
        res.json({ success: true, mensaje: 'Registro eliminado' });
    });
});
transportador.verify((error, success) => {
    if (error) {
        console.error('Error de conexión SMTP — verifica EMAIL_USER y EMAIL_PASS en .env');
        console.error('Detalle:', error.message);
    } else {
        console.log('Servicio de correo listo');
    }
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});