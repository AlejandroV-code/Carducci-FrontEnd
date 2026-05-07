const 
    $submit = document.getElementById("submit"),
    $password = document.getElementById("password"),
    $email = document.getElementById("email"),
    $visible = document.getElementById("visible");

document.addEventListener("change", (e) => {
    if (e.target === $visible) {
        $password.type = $visible.checked ? "text" : "password";
    }
});

// Login API
document.addEventListener("click", async (e) => {
    if (e.target === $submit) {

        e.preventDefault();

        if ($password.value !== "" && $email.value !== "") {
            try {
                const respuesta = await fetch(
                    "https://api.residencia.nomics.tech/auth/login",
                    {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: $email.value,
                            password: $password.value
                        })
                    }
                );

                const data = await respuesta.json();
                console.log(data);

                if (respuesta.ok) {
                    alert("Login correcto");
                    window.location.href = "home.html";
                } else {
                    alert("Credenciales incorrectas");
                }

            } catch (error) {
                console.error(error);
                alert("Error conectando API");
            }
        }
    }
});