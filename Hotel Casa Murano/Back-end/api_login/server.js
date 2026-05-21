const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'db_hotel'
});

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


app.post('/api/recuperar-password', async (req, res) => {

    try {

        const { correo } = req.body;

        const [usuario] = await conexion.query(
            'SELECT * FROM administrador WHERE correo = ?',
            [correo]
        );

        if (usuario.length === 0) {

            return res.status(404).json({
                success: false,
                mensaje: 'Correo no encontrado'
            });

        }

        res.json({
            success: true,
            mensaje: 'Correo encontrado'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            mensaje: 'Error del servidor'
        });

    }

});

app.post('/api/nueva-password', async (req, res) => {

    try {

        const {
            correo,
            contrasena
        } = req.body;

        await conexion.query(
            `
            UPDATE administrador
            SET contrasena = ?
            WHERE correo = ?
            `,
            [
                contrasena,
                correo
            ]
        );

        res.json({
            success: true,
            mensaje: 'Contraseña actualizada correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            mensaje: 'Error al actualizar contraseña'
        });

    }

});