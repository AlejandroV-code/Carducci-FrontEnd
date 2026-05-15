const $botonEnviar = document.getElementById("boton-enviar");
const $entradaUsuario = document.getElementById("entrada-usuario");
const $cajaMensajes = document.getElementById("caja-mensajes");

function agregarMensaje(texto, tipo) {
    const mensaje = document.createElement("div");

    mensaje.classList.add("mensaje", `mensaje-${tipo}`);

    mensaje.textContent = texto;

    $cajaMensajes.appendChild(mensaje);

    $cajaMensajes.scrollTop = $cajaMensajes.scrollHeight;
}

$botonEnviar.addEventListener("click", async () => {

    const texto = $entradaUsuario.value.trim();

    if (!texto) return;

    agregarMensaje(texto, "usuario");

    $entradaUsuario.value = "";

    try {

        const respuesta = await fetch(
            "https://api.residencia.nomics.tech/chatbot",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: texto
                })
            }
        );

        if (!respuesta.ok) {
            throw new Error("Error en la API");
        }

        const datos = await respuesta.json();
        console.log("Respuesta del back:", datos);

        const textoBoot = datos.response ?? datos.message ?? datos.reply ?? datos.answer ?? datos.text ?? JSON.stringify(datos);
        agregarMensaje(textoBoot, "bot");

    } catch (error) {

        console.error(error);

        agregarMensaje("Ocurrió un error.", "bot");
    }

});

$entradaUsuario.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        $botonEnviar.click();
    }
});
