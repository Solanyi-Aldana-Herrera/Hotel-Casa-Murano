document.addEventListener("DOMContentLoaded", function() {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    /**
     * Función para actualizar la interfaz visual
     */
    function actualizarVistaFecha(fechaStr, idDia, idMes) {
        const elDia = document.getElementById(idDia);
        const elMes = document.getElementById(idMes);

        if (elDia && elMes && fechaStr) {
            // Se usa T00:00:00 para asegurar que la fecha sea local y no UTC
            const fecha = new Date(fechaStr + 'T00:00:00');
            
            elDia.innerText = fecha.getDate();
            elMes.innerText = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
        } else {
            console.error(`Error: No se encontraron los elementos ${idDia} o ${idMes}`);
        }
    }

    /**
     * Configuración inicial para un input específico
     */
    function configurarInputFecha(idInput, idDia, idMes, offsetDias = 0) {
        const input = document.getElementById(idInput);
        if (!input) return;

        // Establecer fecha por defecto (Hoy + offset)
        const fechaBase = new Date();
        fechaBase.setDate(fechaBase.getDate() + offsetDias);

        const yyyy = fechaBase.getFullYear();
        const mm = String(fechaBase.getMonth() + 1).padStart(2, '0');
        const dd = String(fechaBase.getDate()).padStart(2, '0');
        const fechaFormateada = `${yyyy}-${mm}-${dd}`;

        // Asignar al input y actualizar vista inmediatamente
        input.value = fechaFormateada;
        actualizarVistaFecha(fechaFormateada, idDia, idMes);

        // Escuchar cambios futuros
        input.addEventListener("change", function() {
            actualizarVistaFecha(this.value, idDia, idMes);
        });
    }

    // Inicializar Entrada (Hoy) y Salida (Mañana)
    configurarInputFecha("input-entrada", "dia-entrada", "mes-entrada", 0);
    configurarInputFecha("input-salida", "dia-salida", "mes-salida", 1);
});

//Ocupación//
// Función para abrir y cerrar el formulario
function toggleOcupacion() {
    const dropdown = document.getElementById('dropdown-ocupacion');
    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

// Sincroniza los números del formulario con la vista principal
function actualizarOcupacion() {
    const adultos = document.getElementById('cant-adultos').value;
    const ninos = document.getElementById('cant-ninos').value;

    document.getElementById('num-adultos').innerText = adultos;
    document.getElementById('num-ninos').innerText = ninos;
}

// Cerrar si se hace clic fuera del buscador
window.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdown-ocupacion');
    const selector = document.querySelector('.ocupacion-selector');
    if (dropdown && !selector.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
    }
});


function irAReserva() {
    const entrada = document.getElementById('input-entrada').value;
    const salida = document.getElementById('input-salida').value;

    if (entrada && salida) {
        const d1 = new Date(entrada + 'T00:00:00');
        const d2 = new Date(salida + 'T00:00:00');
        const noches = Math.max(0, Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)));
        const adultos = document.getElementById('num-adultos').innerText;
        const ninos = document.getElementById('num-ninos').innerText;

        sessionStorage.setItem('reservaHome', JSON.stringify({
            entrada: entrada,
            salida: salida,
            noches: noches,
            adultos: parseInt(adultos),
            ninos: parseInt(ninos)
        }));
    }

    window.location.href = '/frontend/pages/reserva.html';
}

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const hero = document.querySelector('.hero-section');
    const threshold = hero ? hero.offsetTop + hero.offsetHeight - header.offsetHeight : 50;
    if (window.scrollY > threshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

