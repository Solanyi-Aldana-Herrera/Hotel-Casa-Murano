// ABRIR MODAL
function abrirModal(titulo, texto){

    document.getElementById("tituloModal").innerText = titulo;

    document.getElementById("textoModal").innerText = texto;

    document.getElementById("modalHabitacion").style.display = "flex";
}

// CERRAR MODAL
function cerrarModal(){

    document.getElementById("modalHabitacion").style.display = "none";
}

// CERRAR AL DAR CLICK AFUERA
window.onclick = function(event){

    let modal = document.getElementById("modalHabitacion");

    if(event.target == modal){

        modal.style.display = "none";
    }
}

