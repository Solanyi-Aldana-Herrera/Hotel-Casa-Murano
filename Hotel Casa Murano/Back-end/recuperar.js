document
.getElementById('formRecuperar')
.addEventListener('submit', async (e) => {

    e.preventDefault();

    const correo =
        document.getElementById('correo').value;

    try {

        const respuesta = await fetch(
            'http://localhost:3000/api/recuperar-password',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo
                })
            }
        );

        const datos = await respuesta.json();

        if (datos.success) {

            localStorage.setItem(
                'correoRecuperacion',
                correo
            );

            window.location.href =
                'Front-end/paginas/nueva-password.html';

        } else {

            document.getElementById('mensaje')
            .textContent =
            datos.mensaje;

        }

    } catch (error) {

        console.error(error);

        alert('Error de conexión');

    }

});