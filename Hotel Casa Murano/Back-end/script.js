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


window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


//Movimiento del slide//
const slides = document.querySelectorAll('.slide');

let index = 0;

function cambiarSlide() {

    slides[index].classList.remove('active');

    index++;

    if(index >= slides.length){
        index = 0;
    }

    slides[index].classList.add('active');
}

setInterval(cambiarSlide, 5000);