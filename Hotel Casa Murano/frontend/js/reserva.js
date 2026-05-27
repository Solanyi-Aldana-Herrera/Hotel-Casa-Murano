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
    adultos: 0,
    ninos: 0,
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

function actualizarNavActivo(sectionId) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        const text = link.textContent.trim();
        const entry = NAV_MAP.find(m => m.linkText === text);
        if (entry && entry.sectionId === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function irASeccion(sectionId) {
    const ids = NAV_MAP.map(m => m.sectionId);
    ids.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    window.scrollTo({ top: document.getElementById(sectionId).offsetTop - 30, behavior: 'smooth' });
    actualizarNavActivo(sectionId);
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

    if (reservaData.entrada && reservaData.salida) {
        reservaData.noches = calcularNoches(reservaData.entrada, reservaData.salida);
    }
    if (!reservaData.adultos && !reservaData.ninos) {
        reservaData.adultos = h.capacidad;
        reservaData.ninos = 0;
    }

    irASeccion('digitacion-datos');
}

/* =========================
   Funciones class reserva (reserva.html)
   ========================= */
const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function toggleRvaOcupacion() {
    const dropdown = document.getElementById('rva-dropdown-ocupacion');
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

function actualizarRvaOcupacion() {
    const adultos = document.getElementById('rva-cant-adultos').value;
    const ninos = document.getElementById('rva-cant-ninos').value;
    document.getElementById('rva-num-adultos').innerText = adultos;
    document.getElementById('rva-num-ninos').innerText = ninos;
    reservaData.adultos = parseInt(adultos);
    reservaData.ninos = parseInt(ninos);
}

function actualizarRvaVistaFecha(fechaStr, idDia, idMes) {
    const elDia = document.getElementById(idDia);
    const elMes = document.getElementById(idMes);
    if (elDia && elMes && fechaStr) {
        const fecha = new Date(fechaStr + 'T00:00:00');
        elDia.innerText = fecha.getDate();
        elMes.innerText = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    }
}

function configurarRvaFecha(idInput, idDia, idMes, offsetDias = 0) {
    const input = document.getElementById(idInput);
    if (!input) return;
    const fechaBase = new Date();
    fechaBase.setDate(fechaBase.getDate() + offsetDias);
    const yyyy = fechaBase.getFullYear();
    const mm = String(fechaBase.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaBase.getDate()).padStart(2, '0');
    const fechaFormateada = `${yyyy}-${mm}-${dd}`;
    input.value = fechaFormateada;
    actualizarRvaVistaFecha(fechaFormateada, idDia, idMes);

    if (idInput === 'rva-input-entrada') {
        reservaData.entrada = fechaFormateada;
    } else if (idInput === 'rva-input-salida') {
        reservaData.salida = fechaFormateada;
    }

    input.addEventListener("change", function () {
        actualizarRvaVistaFecha(this.value, idDia, idMes);
        if (idInput === 'rva-input-entrada') {
            reservaData.entrada = this.value;
        } else if (idInput === 'rva-input-salida') {
            reservaData.salida = this.value;
        }
        if (reservaData.entrada && reservaData.salida) {
            reservaData.noches = calcularNoches(reservaData.entrada, reservaData.salida);
        }
    });
}

function guardarReservaHome() {
    const entrada = document.getElementById('rva-input-entrada').value;
    const salida = document.getElementById('rva-input-salida').value;
    if (!entrada || !salida) {
        alert('Por favor selecciona las fechas de entrada y salida.');
        return;
    }
    if (reservaData.entrada && reservaData.salida) {
        reservaData.noches = calcularNoches(reservaData.entrada, reservaData.salida);
    }
    irASeccion('digitacion-datos');
}

function cerrarRvaOcupacion(e) {
    const dropdown = document.getElementById('rva-dropdown-ocupacion');
    const selector = document.querySelector('.ocupacion-selector');
    if (dropdown && !selector.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
}

/* =========================
   Cargar datos desde index
   ========================= */
function cargarReservaHome() {
    const datos = sessionStorage.getItem('reservaHome');
    if (!datos) return;

    const data = JSON.parse(datos);
    sessionStorage.removeItem('reservaHome');

    document.getElementById('rva-input-entrada').value = data.entrada;
    document.getElementById('rva-input-salida').value = data.salida;
    actualizarRvaVistaFecha(data.entrada, 'rva-dia-entrada', 'rva-mes-entrada');
    actualizarRvaVistaFecha(data.salida, 'rva-dia-salida', 'rva-mes-salida');

    document.getElementById('rva-cant-adultos').value = data.adultos;
    document.getElementById('rva-cant-ninos').value = data.ninos;
    document.getElementById('rva-num-adultos').innerText = data.adultos;
    document.getElementById('rva-num-ninos').innerText = data.ninos;

    reservaData.entrada = data.entrada;
    reservaData.salida = data.salida;
    reservaData.noches = data.noches;
    reservaData.adultos = data.adultos;
    reservaData.ninos = data.ninos;
}

document.addEventListener('DOMContentLoaded', function () {
    // Marcar el nav de la primera sección como activa sin scrollear
    actualizarNavActivo('habitacion-detalle-reserva');

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const text = this.textContent.trim();
            const entry = NAV_MAP.find(m => m.linkText === text);
            if (!entry) return;

            if (entry.sectionId === 'digitacion-datos') {
                const entrada = document.getElementById('rva-input-entrada').value;
                const salida = document.getElementById('rva-input-salida').value;
                if (!entrada || !salida) {
                    alert('Por favor selecciona las fechas de entrada y salida.');
                    return;
                }
                if (!reservaData.habitacion) {
                    alert('Primero debes seleccionar una habitación.');
                    return;
                }
            }

            if (entry.sectionId === 'resumen-reserva') {
                const entrada = document.getElementById('rva-input-entrada').value;
                const salida = document.getElementById('rva-input-salida').value;
                if (!entrada || !salida) {
                    alert('Por favor selecciona las fechas de entrada y salida.');
                    return;
                }
                if (!reservaData.habitacion) {
                    alert('Primero debes seleccionar una habitación.');
                    return;
                }
                const nombres = document.getElementById('nombres').value.trim();
                if (!nombres) {
                    alert('Primero debes completar tus datos personales.');
                    return;
                }
            }

            irASeccion(entry.sectionId);
        });
    });


    configurarRvaFecha('rva-input-entrada', 'rva-dia-entrada', 'rva-mes-entrada', 0);
    configurarRvaFecha('rva-input-salida', 'rva-dia-salida', 'rva-mes-salida', 1);
    window.addEventListener('click', cerrarRvaOcupacion);

    cargarReservaHome();
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
    const adultos = reservaData.adultos || 0;
    const ninos = reservaData.ninos || 0;
    const totalPersonas = adultos + ninos;
    document.getElementById('resumen-ocupacion').textContent =
        `Adultos: ${adultos}, Niños: ${ninos}, Total: ${totalPersonas} personas`;

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
        'Ocupaci\u00f3n: Adultos ' + reservaData.adultos + ', Ni\u00f1os ' + reservaData.ninos + ', Total ' + (reservaData.adultos + reservaData.ninos) + ' personas',
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
