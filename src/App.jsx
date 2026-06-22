import { useState } from "react";
import LiveChatWidget from "./components/LiveChatWidget";

const LOCATIONS = [
  {
    value: "santos",
    label: "Santos",
    groupId: Number(import.meta.env.VITE_LIVECHAT_GROUP_SANTOS),
  },
  {
    value: "sao_paulo",
    label: "São Paulo",
    groupId: Number(import.meta.env.VITE_LIVECHAT_GROUP_SAO_PAULO),
  },
];

export default function App() {
  const [form, setForm] = useState({
    name: "",
    localidade: "santos",
  });

  const [customer, setCustomer] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const selectedLocation = LOCATIONS.find(
    (location) => location.value === form.localidade
  );

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      alert("Informe seu nome para iniciar o atendimento.");
      return;
    }

    if (!selectedLocation) {
      alert("Localidade inválida.");
      return;
    }

    if (!selectedLocation.groupId || Number.isNaN(selectedLocation.groupId)) {
      alert(
        `O grupo do LiveChat para ${selectedLocation.label} não está configurado.`
      );
      return;
    }

    setLoadingChat(true);

    setCustomer({
      name,
      localidade: selectedLocation.label,
      localidadeKey: selectedLocation.value,
      groupId: selectedLocation.groupId,
    });
  }

  return (
    <>
      <LiveChatWidget customer={customer} />

      <main className="page">
        <section className="hero">
          <div className="heroContent">
            <span className="badge">Atendimento Online</span>

            <h1>Fale com a equipe certa para sua região</h1>

            <p>
              Preencha seus dados e vamos direcionar você automaticamente para
              os analistas responsáveis pela sua localidade.
            </p>
          </div>

          <div className="card">
            <h2>Iniciar atendimento</h2>

            <form onSubmit={handleSubmit}>
              <label>
                Nome
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Digite seu nome"
                  autoComplete="name"
                />
              </label>

              <label>
                Localidade
                <select
                  name="localidade"
                  value={form.localidade}
                  onChange={handleChange}
                >
                  {LOCATIONS.map((location) => (
                    <option key={location.value} value={location.value}>
                      {location.label}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit">
                {loadingChat ? "Abrindo chat..." : "Iniciar chat"}
              </button>
            </form>

            {customer && (
              <div className="status">
                Atendimento direcionado para{" "}
                <strong>{customer.localidade}</strong>. A janela do chat deve
                abrir no canto da tela.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}