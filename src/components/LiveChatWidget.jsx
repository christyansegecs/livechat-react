import { useEffect } from "react";

function isValidNumber(value) {
  return value && !Number.isNaN(Number(value));
}

function setupLiveChatSnippet() {
  const license = import.meta.env.VITE_LIVECHAT_LICENSE;

  if (!isValidNumber(license)) {
    console.error(
      "Licença do LiveChat inválida. Verifique VITE_LIVECHAT_LICENSE no arquivo .env"
    );
    return false;
  }

  window.__lc = window.__lc || {};
  window.__lc.license = Number(license);
  window.__lc.integration_name = "manual_channels";
  window.__lc.product_name = "livechat";

  /*
    O widget não carrega automaticamente.
    Ele só será carregado depois que o usuário escolher a localidade.
  */
  window.__lc.asyncInit = true;

  if (window.LiveChatWidget) {
    return true;
  }

  (function (n, t, c) {
    function i(n) {
      return e._h ? e._h.apply(null, n) : e._q.push(n);
    }

    const e = {
      _q: [],
      _h: null,
      _v: "2.0",

      on: function () {
        i(["on", c.call(arguments)]);
      },

      once: function () {
        i(["once", c.call(arguments)]);
      },

      off: function () {
        i(["off", c.call(arguments)]);
      },

      get: function () {
        if (!e._h) {
          throw new Error(
            "[LiveChatWidget] You can't use getters before load."
          );
        }

        return i(["get", c.call(arguments)]);
      },

      call: function () {
        i(["call", c.call(arguments)]);
      },

      init: function () {
        const existingScript = t.querySelector(
          'script[src="https://cdn.livechatinc.com/tracking.js"]'
        );

        if (existingScript) {
          return;
        }

        const script = t.createElement("script");
        script.async = true;
        script.type = "text/javascript";
        script.src = "https://cdn.livechatinc.com/tracking.js";

        script.onload = function () {
          console.log("Script do LiveChat carregado.");
        };

        script.onerror = function () {
          console.error(
            "Erro ao carregar o script do LiveChat. Verifique bloqueador de anúncios, internet ou licença."
          );
        };

        t.head.appendChild(script);
      },
    };

    if (!n.__lc.asyncInit) {
      e.init();
    }

    n.LiveChatWidget = n.LiveChatWidget || e;
  })(window, document, [].slice);

  return true;
}

export default function LiveChatWidget({ customer }) {
  useEffect(() => {
    setupLiveChatSnippet();
  }, []);

  useEffect(() => {
    if (!customer) return;

    const snippetIsReady = setupLiveChatSnippet();

    if (!snippetIsReady) {
      return;
    }

    if (!window.LiveChatWidget) {
      console.error("LiveChatWidget ainda não está disponível.");
      return;
    }

    const { name, localidade, localidadeKey, groupId } = customer;

    if (!isValidNumber(groupId)) {
      console.error("groupId inválido para:", localidade, groupId);
      return;
    }

    function sendCustomerData() {
      console.log("Enviando dados para o LiveChat:", {
        name,
        localidade,
        localidadeKey,
        groupId,
      });

      window.LiveChatWidget.call("set_customer_name", name);

      window.LiveChatWidget.call("update_session_variables", {
        nome: name,
        localidade,
        localidade_key: localidadeKey,
        grupo_livechat: String(groupId),
        origem: "site-react",
      });
    }

    if (!window.__livechatInitialized) {
      console.log("Inicializando LiveChat no grupo:", groupId);

      /*
        Este é o ponto do roteamento:
        precisa vir ANTES do init().
      */
      window.__lc.group = Number(groupId);
      window.__livechatInitialized = true;

      window.LiveChatWidget.once("ready", () => {
        console.log("LiveChat pronto.");

        sendCustomerData();

        /*
          Abre a janelinha automaticamente.
        */
        window.LiveChatWidget.call("maximize");
      });

      window.LiveChatWidget.init();

      return;
    }

    sendCustomerData();
    window.LiveChatWidget.call("maximize");
  }, [customer]);

  return null;
}