const editor = document.getElementById("codeEditor");
const saveBtn = document.getElementById("saveBtn");
const autosave = document.getElementById("autosave");
const status = document.getElementById("status");
const runBtn = document.getElementById("runBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("consoleOutput");
const popOutBtn = document.getElementById("popOutBtn");
const visibility = document.getElementById("visibility");
const loginBtn = document.getElementById("loginBtn");
const userInfo = document.getElementById("userInfo");

let autosaveInterval = null;
let popOutWindow = null;

// Cargar código inicial al iniciar
fetch("/api/code")
  .then(res => res.json())
  .then(data => {
    editor.value = data.code || "";
    visibility.value = data.visibility || "private";
  })
  .catch(err => {
    console.error("Error al cargar código:", err);
  });

saveBtn.addEventListener("click", () => {
  saveCode();
});

autosave.addEventListener("change", () => {
  if (autosave.checked) {
    autosaveInterval = setInterval(() => saveCode(true), 30 * 60 * 1000);
    status.innerText = "Guardado automático activado";
  } else {
    clearInterval(autosaveInterval);
    status.innerText = "Guardado automático desactivado";
  }
});

runBtn.addEventListener("click", () => {
  executeCode();
});

stopBtn.addEventListener("click", () => {
  appendToConsole("[Proceso detenido por el usuario]");
});

clearBtn.addEventListener("click", () => {
  output.innerText = "// Consola limpiada\n";
});

popOutBtn.addEventListener("click", () => {
  if (!popOutWindow || popOutWindow.closed) {
    const newWin = window.open("", "_blank", "width=600,height=400");
    newWin.document.write(`
      <title>Consola externa</title>
      <style>
        body { background-color: #111; color: #b5e853; font-family: monospace; padding: 1rem; }
        pre { white-space: pre-wrap; }
      </style>
      <pre id="externalConsole">// Esperando mensajes...</pre>
    `);
    popOutWindow = newWin;
    output.style.display = "none";
    appendToConsole("[Consola movida a nueva ventana]");
  } else {
    popOutWindow.focus();
  }
});

function saveCode(auto = false) {
  const code = editor.value;
  const visibilitySetting = visibility.value;

  fetch("/api/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, visibility: visibilitySetting })
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    })
    .then(() => {
      status.innerText = auto ? "Guardado automático realizado" : "Guardado manual realizado";
    })
    .catch(err => {
      console.error(err);
      status.innerText = "Error al guardar";
    });
}

function executeCode() {
  const code = editor.value;

  appendToConsole("// Ejecutando código...");
  fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  })
    .then(res => res.json())
    .then(data => {
      appendToConsole(data.output || "// Sin salida");
    })
    .catch(err => {
      appendToConsole("❌ Error de ejecución: " + err.message);
    });
}

function appendToConsole(msg) {
  const timestamp = new Date().toLocaleTimeString();
  const formatted = `[${timestamp}] ${msg}\n`;
  output.innerText += formatted;

  if (popOutWindow && !popOutWindow.closed) {
    popOutWindow.document.getElementById("externalConsole").innerText += formatted;
  }
}

loginBtn.addEventListener("click", () => {
  window.location.href = "/login";
});

fetch("/user")
  .then((res) => {
    if (!res.ok) throw new Error("No autenticado");
    return res.json();
  })
  .then((user) => {
    userInfo.innerHTML = `
      <img src="${user.avatar_url}" alt="avatar" />
      <span>${user.login}</span>
      <button class="logoutBtn" id="logoutBtn">Cerrar sesión</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", () => {
      window.location.href = "/logout";
    });
  })
  .catch(() => {
    userInfo.innerHTML = `<button id="loginBtn">Iniciar sesión con GitHub</button>`;
    document.getElementById("loginBtn").addEventListener("click", () => {
      window.location.href = "/login";
    });
  });


const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});
