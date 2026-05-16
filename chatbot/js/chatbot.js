const $botonEnviar = document.getElementById("boton-enviar");
const $entradaUsuario = document.getElementById("entrada-usuario");
const $cajaMensajes = document.getElementById("caja-mensajes");

// Historial de conversación que se envía al backend en cada request
const historial = [];

function agregarMensaje(texto, tipo) {
    const mensaje = document.createElement("div");

    mensaje.classList.add("mensaje", `mensaje-${tipo}`);

    if (tipo === "bot") {
        mensaje.innerHTML = DOMPurify.sanitize(marked.parse(texto));
    } else {
        mensaje.textContent = texto;
    }

    $cajaMensajes.appendChild(mensaje);
    $cajaMensajes.scrollTop = $cajaMensajes.scrollHeight;

    return mensaje;
}

function mostrarTyping() {
    const typing = document.createElement("div");
    typing.classList.add("mensaje", "mensaje-bot", "typing-indicator");
    typing.id = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    $cajaMensajes.appendChild(typing);
    $cajaMensajes.scrollTop = $cajaMensajes.scrollHeight;
}

function ocultarTyping() {
    document.getElementById("typing")?.remove();
}

function bloquearUI() {
    $botonEnviar.disabled = true;
    $entradaUsuario.disabled = true;
    $botonEnviar.style.opacity = "0.5";
    $botonEnviar.style.cursor = "not-allowed";
}

function desbloquearUI() {
    $botonEnviar.disabled = false;
    $entradaUsuario.disabled = false;
    $botonEnviar.style.opacity = "";
    $botonEnviar.style.cursor = "";
    $entradaUsuario.focus();
}

$botonEnviar.addEventListener("click", async () => {

    const texto = $entradaUsuario.value.trim();

    if (!texto) return;

    agregarMensaje(texto, "usuario");
    historial.push({ role: "user", content: texto });

    $entradaUsuario.value = "";
    bloquearUI();
    mostrarTyping();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 segundos

    try {

        const respuesta = await fetch(
            "http://localhost:8001/chatbot",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: texto,
                    messages: historial
                }),
                signal: controller.signal
            }
        );

        clearTimeout(timeoutId);

        if (!respuesta.ok) {
            const status = respuesta.status;
            if (status === 401) throw new Error("No autorizado. Por favor inicia sesión.");
            if (status === 429) throw new Error("Demasiadas solicitudes. Espera un momento.");
            if (status >= 500) throw new Error("Error en el servidor. Intenta más tarde.");
            throw new Error(`Error ${status}`);
        }

        const datos = await respuesta.json();
        const textoBot = datos.response ?? datos.message ?? datos.reply ?? datos.answer ?? datos.text ?? JSON.stringify(datos);

        ocultarTyping();
        agregarMensaje(textoBot, "bot");
        historial.push({ role: "assistant", content: textoBot });

    } catch (error) {

        clearTimeout(timeoutId);
        ocultarTyping();

        if (error.name === "AbortError") {
            agregarMensaje("La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.", "bot");
        } else {
            agregarMensaje(error.message || "Ocurrió un error inesperado.", "bot");
        }

        console.error(error);

        // Revertir el último mensaje del historial si falló
        historial.pop();

    } finally {
        desbloquearUI();
    }

});

$entradaUsuario.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        $botonEnviar.click();
    }
});
