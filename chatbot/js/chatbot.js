const $sendBtn = document.getElementById("send-btn");
const $userInput = document.getElementById("user-input");
const $chatBox = document.getElementById("chat-box");

function addMessage(text, type) {
    const msg = document.createElement("div");

    msg.classList.add("message", `${type}-message`);

    msg.textContent = text;

    $chatBox.appendChild(msg);

    $chatBox.scrollTop = $chatBox.scrollHeight;
}

$sendBtn.addEventListener("click", async () => {

    const text = $userInput.value.trim();

    if (!text) return;

    // mensaje usuario
    addMessage(text, "user");

    $userInput.value = "";

    try {

        const response = await fetch(
            "https://api.residencia.nomics.tech/chatbot",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text
                })
            }
        );

        if(!response.ok){
            throw new Error("Error en la API");
        }

        const data = await response.json();

        // respuesta bot
        addMessage(data.response, "bot");

    } catch(error){

        console.error(error);

        addMessage("Ocurrió un error.", "bot");
    }

});

$userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        $sendBtn.click();
    }
});