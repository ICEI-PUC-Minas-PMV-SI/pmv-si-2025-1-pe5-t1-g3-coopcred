document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const valor = document.getElementById("valor").value;

  try {
    const res = await fetch(`${window.API_URL}/dados`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, valor }),
    });

    const data = await res.json();
    alert(data.message || "Erro");
  } catch (err) {
    console.error(err);
    alert("Erro ao enviar dados");
  }
});
