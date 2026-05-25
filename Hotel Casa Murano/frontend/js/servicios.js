// ABRIR IMAGEN
function abrirImagen(src){

    document.getElementById("modalGaleria").style.display = "flex";

    document.getElementById("imagenGrande").src = src;
}

// CERRAR IMAGEN
document.querySelector(".modal-close").onclick = function(){

    document.getElementById("modalGaleria").style.display = "none";
}

// CERRAR AL DAR CLICK AFUERA
window.onclick = function(event){

    let modal = document.getElementById("modalGaleria");

    if(event.target == modal){

        modal.style.display = "none";
    }
}