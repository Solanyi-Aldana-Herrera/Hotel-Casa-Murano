const habitaciones = [
    {
        nombre: 'Suite Deluxe',
        imagen: '/frontend/images/contenido/Frente de hotel.webp',
        descripcion: 'Habitación amplia con vista panorámica, jacuzzi y minibar.',
        detalle: 'Habitación cómoda de 12 m2, ubicada en el primer piso ofrece una cama sencilla con baño privado, tv pantalla plana, wi-Fi gratuito con ocupación de hasta 1 persona.',
        precio: 250000,
        capacidad: 1,
    },
    {
        nombre: 'Habitación Estándar',
        imagen: '/frontend/images/contenido/Frente de hotel.webp',
        descripcion: 'Comodidad y elegancia a un precio accesible.',
        detalle: 'Habitación amplia con jacuzzi, minibar, televisión, Wi-Fi y vista panorámica.',
        precio: 180000,
        capacidad: 2,
    },
    {
        nombre: 'Suite Deluxe',
        imagen: '/frontend/images/contenido/Frente de hotel.webp',
        descripcion: 'Habitación amplia con vista panorámica, jacuzzi y minibar.',
        detalle: 'Habitación amplia con jacuzzi, minibar, televisión, Wi-Fi y vista panorámica.',
        precio: 250000,
        capacidad: 1,
    },
    {
        nombre: 'Habitación Estándar',
        imagen: '/frontend/images/contenido/Frente de hotel.webp',
        descripcion: 'Comodidad y elegancia a un precio accesible.',
        detalle: 'Habitación amplia con jacuzzi, minibar, televisión, Wi-Fi y vista panorámica.',
        precio: 180000,
        capacidad: 2,
    },
];

const NAV_MAP = [
    { linkText: 'Selecciona la habitación', sectionId: 'habitacion-detalle-reserva' },
    { linkText: 'Digita tus datos', sectionId: 'digitacion-datos' },
    { linkText: 'Confirma tu reserva', sectionId: 'resumen-reserva' },
];

const WHATSAPP_NUMBER = '573144785524';

let reservaData = {
    habitacion: null,
    entrada: '',
    salida: '',
    noches: 0,
    ocupacion: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numDocumento: '',
    celular: '',
    email: '',
    fechaNacimiento: '',
    comentario: '',
};

function formatearPrecio(valor) {
    return '$' + valor.toLocaleString('es-CO') + ' COP';
}

function calcularNoches(entrada, salida) {
    const d1 = new Date(entrada);
    const d2 = new Date(salida);
    return Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
}

function irASeccion(sectionId) {
    const ids = NAV_MAP.map(m => m.sectionId);
    ids.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    window.scrollTo({ top: document.getElementById(sectionId).offsetTop - 30, behavior: 'smooth' });
}

function renderizarHabitaciones() {
    const contenedor = document.getElementById('lista-habitaciones');
    contenedor.innerHTML = '';

    habitaciones.forEach((h, index) => {
        const item = document.createElement('div');
        item.className = 'habitacion-item';

        item.innerHTML = `
            <div class="habitacion-img">
                <img src="${h.imagen}" alt="${h.nombre}">
            </div>
            <div class="habitacion-info">
                <h4>${h.nombre}</h4>
                <p>${h.detalle}</p>
            </div>
            <div class="habitacion-accion">
                <div class="habitacion-precio">${formatearPrecio(h.precio)}</div>
                <button class="btn-seleccionar" data-index="${index}">Seleccionar</button>
            </div>
        `;

        contenedor.appendChild(item);
    });

    contenedor.querySelectorAll('.btn-seleccionar').forEach(btn => {
        btn.addEventListener('click', function () {
            const index = parseInt(this.dataset.index);
            seleccionarHabitacion(index);
        });
    });
}

function seleccionarHabitacion(index) {
    const h = habitaciones[index];
    reservaData.habitacion = h;

    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);
    const pasado = new Date(hoy);
    pasado.setDate(hoy.getDate() + 2);

    const fEntrada = hoy.toISOString().split('T')[0];
    const fSalida = pasado.toISOString().split('T')[0];

    reservaData.entrada = fEntrada;
    reservaData.salida = fSalida;
    reservaData.noches = calcularNoches(fEntrada, fSalida);
    reservaData.ocupacion = h.capacidad + (h.capacidad === 1 ? ' persona' : ' personas');

    irASeccion('digitacion-datos');
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const text = this.textContent.trim();
            const entry = NAV_MAP.find(m => m.linkText === text);
            if (!entry) return;
            irASeccion(entry.sectionId);
        });
    });

    renderizarHabitaciones();

    document.getElementById('btn-siguiente').addEventListener('click', function () {
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const tipoDoc = document.getElementById('tipo-documento').value;
        const numDoc = document.getElementById('num-documento').value.trim();
        const celular = document.getElementById('celular').value.trim();
        const email = document.getElementById('email').value.trim();
        const fechaNac = document.getElementById('fecha-nacimiento').value;
        const comentario = document.getElementById('comentario').value.trim();

        if (!nombres || !apellidos || !tipoDoc || !numDoc || !celular || !email || !fechaNac) {
            alert('Por favor completa todos los campos obligatorios.');
            return;
        }

        reservaData.nombres = nombres;
        reservaData.apellidos = apellidos;
        reservaData.tipoDocumento = tipoDoc;
        reservaData.numDocumento = numDoc;
        reservaData.celular = celular;
        reservaData.email = email;
        reservaData.fechaNacimiento = fechaNac;
        reservaData.comentario = comentario || 'Sin novedades';

        actualizarResumen();
        irASeccion('resumen-reserva');
    });

    document.getElementById('check-terminos').addEventListener('change', function () {
        document.getElementById('btn-confirmar').disabled = !this.checked;
    });

    document.getElementById('btn-confirmar').addEventListener('click', function () {
        enviarWhatsApp();
    });
});

function actualizarResumen() {
    const h = reservaData.habitacion;

    document.getElementById('resumen-habitacion').textContent = h ? h.nombre : '—';
    document.getElementById('resumen-entrada').textContent = reservaData.entrada || '—';
    document.getElementById('resumen-salida').textContent = reservaData.salida || '—';
    document.getElementById('resumen-noches').textContent = reservaData.noches || '—';
    document.getElementById('resumen-ocupacion').textContent = reservaData.ocupacion || '—';

    document.getElementById('resumen-nombres').textContent =
        reservaData.nombres + ' ' + reservaData.apellidos || '—';
    document.getElementById('resumen-documento').textContent =
        (reservaData.tipoDocumento || '') + ' ' + (reservaData.numDocumento || '—');
    document.getElementById('resumen-celular').textContent = reservaData.celular || '—';
    document.getElementById('resumen-email').textContent = reservaData.email || '—';
    document.getElementById('resumen-fecha-nac').textContent = reservaData.fechaNacimiento || '—';
    document.getElementById('resumen-comentario').textContent = reservaData.comentario || '—';

    document.getElementById('resumen-total').textContent =
        h ? formatearPrecio(h.precio * (reservaData.noches || 1)) : '—';
}

function enviarWhatsApp() {
    const h = reservaData.habitacion;
    if (!h) return;

    const total = h.precio * (reservaData.noches || 1);

    const mensaje = [
        'Hola, quiero confirmar mi reserva:',
        '',
        '*HABITACI\u00d3N*',
        'Nombre: ' + h.nombre,
        'Precio por noche: ' + formatearPrecio(h.precio),
        '',
        '*FECHAS*',
        'Entrada: ' + reservaData.entrada,
        'Salida: ' + reservaData.salida,
        'Noches: ' + reservaData.noches,
        'Ocupaci\u00f3n: ' + reservaData.ocupacion,
        '',
        '*DATOS PERSONALES*',
        'Nombres: ' + reservaData.nombres + ' ' + reservaData.apellidos,
        'Documento: ' + reservaData.tipoDocumento + ' ' + reservaData.numDocumento,
        'Celular: ' + reservaData.celular,
        'Email: ' + reservaData.email,
        'Fecha de nacimiento: ' + reservaData.fechaNacimiento,
        '',
        '*COMENTARIO*',
        reservaData.comentario,
        '',
        '*TOTAL*',
        formatearPrecio(total),
        '',
        '\u00a1Gracias!',
    ].join('\n');

    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(mensaje);
    window.open(url, '_blank');
}
