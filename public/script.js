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
  simulateExecution();
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
  console.log(`[${auto ? "Auto" : "Manual"}] Guardado:`, code, visibilitySetting);
  status.innerText = auto ? "Guardado automático realizado" : "Guardado manual realizado";
}

function simulateExecution() {
  appendToConsole("// Ejecutando código...");
  setTimeout(() => {
    const fakeOutput = `>> Resultado de ejecución: ${Math.floor(Math.random() * 1000)}`;
    appendToConsole(fakeOutput);
  }, 1000);
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
      <img src="${user.avatar_url}" alt="avatar" style="height:30px; border-radius:50%;" />
      <span>${user.login}</span>
    `;
  })
  .catch(() => {
    userInfo.innerHTML = `<button id="loginBtn">Iniciar sesión con GitHub</button>`;
    document.getElementById("loginBtn").addEventListener("click", () => {
      window.location.href = "/login";
    });
  });
