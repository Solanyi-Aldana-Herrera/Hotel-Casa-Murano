const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});


// =========================================================================
// CONFIGURACIÓN DEL CONFIGURADOR DE CORREOS (NODEMAILER)
// =========================================================================
const transportador = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'TU_CORREO_GMAIL@gmail.com',       // ⚠️ Pon aquí el correo desde donde saldrán los mensajes
        pass: 'TU_CONTRASEÑA_DE_APLICACION'     // ⚠️ NO ES TU CLAVE NORMAL. Lee la nota de abajo para obtenerla.
    }
});

// Ruta de Login original
app.post('/login', (req, res) => {
    const { usuario, contrasena } = req.body;
    const sql = `SELECT * FROM administrador WHERE usuario = ? AND contrasena = ?`;

    conexion.query(sql, [usuario, contrasena], (error, resultados) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error del servidor' });
        if (resultados.length > 0) {
            return res.json({ success: true, mensaje: 'Bienvenido' });
        } else {
            return res.json({ success: false, mensaje: 'Usuario o contraseña incorrectos' });
        }
    });
});

// =========================================================================
// RUTA DE RECUPERACIÓN ACTUALIZADA CON ENVÍO DE EMAIL REAL
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
        const linkDirecto = `http://127.0.0.1:5500/Front-end/paginas/restablecer.html?id=${adminId}`;

        // 2. Creamos el contenido del correo electrónico
        const opcionesCorreo = {
            from: 'Hotel Casa Murano <TU_CORREO_GMAIL@gmail.com>',
            to: email, // El correo del administrador que lo solicitó
            subject: '🔄 Restablecer Contraseña - Hotel Casa Murano',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Hotel Casa Murano</h2>
                    <p>Hola, has solicitado restablecer tu contraseña de administrador para ingresar al sistema.</p>
                    <p>Para crear una nueva contraseña, por favor haz clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${linkDirecto}" style="background-color: #12cbc4; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 4px;">Restablecer Contraseña</a>
                    </div>
                    <p style="color: #666; font-size: 12px;">Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                </div>
            `
        };

        // 3. Enviar el correo usando Nodemailer
        transportador.sendMail(opcionesCorreo, (errInfo, info) => {
            if (errInfo) {
                console.error('❌ Error al enviar el correo real:', errInfo);
                return res.status(500).json({ success: false, mensaje: 'No se pudo enviar el correo electrónico.' });
            }

            console.log(`📧 Correo enviado con éxito a: ${email}`);
            return res.json({ 
                success: true, 
                mensaje: 'El enlace de recuperación ha sido enviado directamente a tu correo electrónico.' 
            });
        });
    });
});

// Ruta para actualizar clave
app.post('/actualizar-clave-directa', (req, res) => {
    const { id, contrasena } = req.body;
    const sqlActualizar = 'UPDATE administrador SET contrasena = ? WHERE id = ?';

    conexion.query(sqlActualizar, [contrasena, id], (error, resultado) => {
        if (error) return res.status(500).json({ success: false, mensaje: 'Error al cambiar la contraseña' });
        return res.json({ success: true, mensaje: 'Contraseña actualizada correctamente.' });
    });
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});