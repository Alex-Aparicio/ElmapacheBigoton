$(function () {
  const navbarToggler = document.querySelector(".navbar-toggler");
  const headerElem = document.getElementById("tm-header");
  if (navbarToggler && headerElem) {
    navbarToggler.addEventListener("click", function (e) {
      headerElem.classList.toggle("show");
      e.stopPropagation();
    });

    document.documentElement.addEventListener("click", function (e) {
      if (!headerElem.contains(e.target)) {
        headerElem.classList.remove("show");
      }
    });


  }

  const tmNav = document.getElementById("tm-nav");
  if (tmNav) {
    tmNav.querySelectorAll(".nav-link").forEach(a => {
      a.addEventListener("click", () => {
        if (headerElem) headerElem.classList.remove("show");
      });
    });
  }

  // === Variables para funcionalidades de Citas ===
  let currentPage = 1;
  const pageSize = 10;
  const tablaId = "tablaCitas";
  const paginationId = "pagination";


  const modalDetallesEl = document.getElementById("modalDetalles");
  const modalDetalles = modalDetallesEl ? new bootstrap.Modal(modalDetallesEl) : null;


  // Modal bootstrap instance: solo si existe el modal en la página
  const modalEl = document.getElementById("modalNuevo");
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

  // --- Helpers ---
  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[s];
    });
  }

  function getStatusClass(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("pend")) return "bg-warning text-dark";
    if (s.includes("progr") || s.includes("en progreso")) return "bg-primary text-white";
    if (s.includes("term") || s.includes("final")) return "bg-success text-white";
    return "bg-secondary text-white";
  }

  // === Cargar citas (paginado) ===
  async function cargarCitas(page = 1) {
    const tbody = document.getElementById(tablaId);
    const placeholder = document.getElementById("placeholder-row");
    if (!tbody) return;

    try {
      const res = await fetch(`http://localhost:8080/api/citas?page=${page - 1}&size=${pageSize}`);
      if (!res.ok) throw new Error("fetch error");
      const data = await res.json();
      const items = data.content ?? data;

      if (!items || items.length === 0) {
        if (placeholder) placeholder.innerHTML = `<td colspan="8" class="text-center text-muted">No hay citas</td>`;
        return;
      }

      tbody.innerHTML = "";
      items.forEach(cita => {
        const tr = document.createElement("tr");
        const barberoNombre = (cita.barbero && (cita.barbero.nombre || cita.barberoNombre)) ?? "—";
        const servicioNombre = (cita.servicio && (cita.servicio.nombre || cita.servicioNombre)) ?? "—";
        const sucursalNombre = (cita.sucursal && (cita.sucursal.nombre || cita.sucursalNombre)) ?? "—";
        const status = cita.status ?? cita.estatus ?? "pendiente";



        tr.innerHTML = `
          <td>${cita.fecha ?? ''}</td>
          <td>${cita.hora ?? ''}</td>
          <td>${escapeHtml(cita.cliente ?? '')}</td>
          <td>${escapeHtml(barberoNombre)}</td>
          <td>${escapeHtml(servicioNombre)}</td>
          <td>${escapeHtml(sucursalNombre)}</td>
          <td><span class="badge ${getStatusClass(status)}">${status}</span></td>
          <td>
            <button class="btn-action btn-ver" data-id="${cita.id}"><i class="fa fa-eye"></i></button>
            <button class="btn-action btn-edit" data-id="${cita.id}"><i class="fa fa-pen"></i></button>
            <button class="btn-action btn-delete" data-id="${cita.id}"><i class="fa fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      attachCitaRowListeners();
    } catch (err) {
      console.error("No se pudieron cargar citas:", err);
      if (placeholder) placeholder.innerHTML = `<td colspan="8" class="text-center text-danger">Error al cargar. Reintenta.</td>`;
    }
  }

  // === Listeners ===
  function attachCitaRowListeners() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.removeEventListener?.("click", onDeleteClick);
      btn.addEventListener("click", onDeleteClick);
    });

    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.removeEventListener?.("click", onEditClick);
      btn.addEventListener("click", onEditClick);
    });

    document.querySelectorAll(".btn-ver").forEach(btn => {
      btn.removeEventListener?.("click", onViewClick);
      btn.addEventListener("click", onViewClick);
    });
  }

  async function onDeleteClick(e) {
    const id = e.currentTarget.getAttribute("data-id");
    if (!confirm("Eliminar esta cita?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/citas/${id}`, { method: "DELETE" });
      if (res.ok) cargarCitas(currentPage);
      else alert("No se pudo eliminar");
    } catch (err) { console.error(err); alert("Error al eliminar"); }
  }

  async function onEditClick(e) {
    const id = e.currentTarget.getAttribute("data-id");
    try {
      const res = await fetch(`http://localhost:8080/api/citas/${id}`);
      if (!res.ok) throw new Error();
      const c = await res.json();

      const fechaEl = document.getElementById("fecha");
      const horaEl = document.getElementById("hora");
      const clienteEl = document.getElementById("cliente");
      const barberoSel = document.getElementById("barbero");
      const servicioSel = document.getElementById("servicio");
      const sucursalSel = document.getElementById("sucursal");

      if (fechaEl) fechaEl.value = c.fecha ?? "";
      if (horaEl) horaEl.value = c.hora ?? "";
      if (clienteEl) clienteEl.value = c.cliente ?? "";

      await Promise.all([
        barberoSel ? cargarBarberos() : null,
        servicioSel ? cargarServicios() : null,
        sucursalSel ? cargarSucursales() : null
      ]);

      if (barberoSel) barberoSel.value = c.barbero?.id ?? c.barberoId ?? "";
      if (servicioSel) servicioSel.value = c.servicio?.id ?? c.servicioId ?? "";
      if (sucursalSel) sucursalSel.value = c.sucursal?.id ?? c.sucursalId ?? "";

      const formEl = document.getElementById("formNuevo");
      if (formEl) formEl.dataset.editId = id;

      if (modal) modal.show();
    } catch (err) {
      console.error("No se pudo cargar cita", err);
    }
  }

  async function onViewClick(e) {
    const id = e.currentTarget.getAttribute("data-id");
    try {
      const res = await fetch(`http://localhost:8080/api/citas/${id}`);
      if (!res.ok) throw new Error();
      const c = await res.json();

      document.getElementById("detalleFecha").textContent = c.fecha ?? "—";
      document.getElementById("detalleHora").textContent = c.hora ?? "—";
      document.getElementById("detalleCliente").textContent = c.cliente ?? "—";

      const barbero = c.barbero?.nombre || c.barberoNombre || "—";
      const servicio = c.servicio?.nombre || c.servicioNombre || "—";
      const sucursal = c.sucursal?.direccion || c.sucursalNombre || "—";
      const status = c.status ?? c.estatus ?? "pendiente";

      document.getElementById("detalleBarbero").textContent = barbero;
      document.getElementById("detalleServicio").textContent = servicio;
      document.getElementById("detalleSucursal").textContent = sucursal;

      const statusEl = document.getElementById("detalleStatus");
      statusEl.textContent = status;
      statusEl.className = `badge ${getStatusClass(status)}`;

      if (modalDetalles) modalDetalles.show();
    } catch (err) {
      console.error("Error al cargar detalles:", err);
      alert("No se pudo cargar la cita.");
    }
  }


  // === cargar barberos ===
  async function cargarBarberos() {
    try {
      const res = await fetch("http://localhost:8080/api/barberos");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = data.content ?? data;
      const sel = document.getElementById("barbero");
      if (!sel) return;
      if (!items || items.length === 0) {
        sel.innerHTML = `<option value="">-- Sin barberos --</option>`;
        return;
      }
      sel.innerHTML = items.map(b => `<option value="${b.id}">${escapeHtml(b.nombre)}</option>`).join("");
    } catch (err) {
      console.error("Error cargando barberos:", err);
      const sel = document.getElementById("barbero");
      if (sel) sel.innerHTML = `<option value="">Error</option>`;
    }
  }

  // === cargar servicios ===
  async function cargarServicios() {
    try {
      const res = await fetch("http://localhost:8080/api/servicios");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = data.content ?? data;
      const sel = document.getElementById("servicio");
      if (!sel) return;
      if (!items || items.length === 0) {
        sel.innerHTML = `<option value="">-- Sin servicios --</option>`;
        return;
      }
      sel.innerHTML = items.map(s => `<option value="${s.id}">${escapeHtml(s.nombre)}</option>`).join("");
    } catch (err) {
      console.error("Error cargando servicios:", err);
      const sel = document.getElementById("servicio");
      if (sel) sel.innerHTML = `<option value="">Error</option>`;
    }
  }

  // === NUEVO: cargar sucursales ===
  async function cargarSucursales() {
    try {
      const res = await fetch("http://localhost:8080/api/sucursales");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items = data.content ?? data;
      const sel = document.getElementById("sucursal");
      if (!sel) return;
      if (!items || items.length === 0) {
        sel.innerHTML = `<option value="">-- Sin sucursales --</option>`;
        return;
      }
      sel.innerHTML = items.map(s => `<option value="${s.id}">${escapeHtml(s.direccion)}</option>`).join("");
    } catch (err) {
      console.error("Error cargando sucursales:", err);
      const sel = document.getElementById("sucursal");
      if (sel) sel.innerHTML = `<option value="">Error</option>`;
    }
  }

  // === Submit handler ===
  const formNuevoEl = document.getElementById("formNuevo");
  if (formNuevoEl) {
    formNuevoEl.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = e.currentTarget.dataset.editId ?? null;

      const payload = {
        fecha: document.getElementById("fecha")?.value ?? null,
        hora: document.getElementById("hora")?.value ?? null,
        cliente: document.getElementById("cliente")?.value ?? null,
        barberoId: Number(document.getElementById("barbero")?.value) || null,
        servicioId: Number(document.getElementById("servicio")?.value) || null,
        sucursalId: Number(document.getElementById("sucursal")?.value) || null
      };

      console.log("Payload a enviar:", payload);

      if (!payload.barberoId || !payload.servicioId || !payload.sucursalId) {
        alert("Selecciona barbero, servicio y sucursal.");
        return;
      }

      try {
        const url = editId ? `http://localhost:8080/api/citas/${editId}` : `http://localhost:8080/api/citas`;
        const method = editId ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const text = await res.text();
        let json;
        try { json = JSON.parse(text); } catch (err) { json = text; }

        if (res.ok) {
          if (modal) modal.hide();
          e.currentTarget?.reset();
          delete e.currentTarget?.dataset.editId;
          cargarCitas(1);
          alert("Cita guardada correctamente");
        } else {
          alert("Error guardando cita: " + (json.message || json.error || json));
        }
      } catch (err) {
        console.error("Error fetch:", err);
        alert("Error al guardar cita.");
      }
    });
  }

  // === Botón Nuevo ===
  const btnNuevo = document.getElementById("btnNuevo");
  if (btnNuevo) {
    btnNuevo.addEventListener("click", async () => {
      const form = document.getElementById("formNuevo");
      if (form) {
        form.reset();
        delete form.dataset.editId;
      }
      await Promise.all([
        cargarBarberos(),
        cargarServicios(),
        cargarSucursales()
      ]);
      if (modal) modal.show();
    });
  }

  // === Paginación ===
  function renderPagination(totalPages, activePage) {
    const pagination = document.getElementById(paginationId);
    if (!pagination) return;
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${activePage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#">«</a>`;
    prevLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage > 1) cargarCitas(activePage - 1); });
    pagination.appendChild(prevLi);

    const maxButtons = 7;
    let start = Math.max(1, activePage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === activePage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (ev) => { ev.preventDefault(); cargarCitas(i); });
      pagination.appendChild(li);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${activePage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
    nextLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage < totalPages) cargarCitas(activePage + 1); });
    pagination.appendChild(nextLi);
  }

  // === Inicialización ===
  if (document.getElementById(tablaId)) {
    cargarCitas(1);
  }
});
