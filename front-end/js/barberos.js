$(function () {
  // Variables
  let currentPage = 1;
  const pageSize = 10;
  const tablaId = "tablaBarberos";
  const paginationId = "paginationBarberos";

  // Modal bootstrap
  const modalEl = document.getElementById("modalBarbero");
  const modal = new bootstrap.Modal(modalEl);

  // Helpers
  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[s];
    });
  }

  // Cargar página de barberos
  async function cargarBarberos(page = 1) {
    const tbody = document.getElementById(tablaId);
    const placeholder = document.getElementById("placeholder-barbero");
    try {
      const res = await fetch(`http://localhost:8080/api/barberos?page=${page - 1}&size=${pageSize}`);
      if (!res.ok) throw new Error("Error al obtener barberos");
      const data = await res.json();
      const items = data.content ?? data;
      const totalPages = data.totalPages ?? Math.ceil((data.length || items.length) / pageSize);

      if (!items || items.length === 0) {
        if (placeholder) {
          tbody.innerHTML = "";
          tbody.appendChild(placeholder);
          placeholder.innerHTML = `<td colspan="2" class="text-center text-muted">No hay barberos</td>`;
        } else {
          tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No hay barberos</td></tr>`;
        }
        renderPagination(totalPages, page);
        return;
      }

      tbody.innerHTML = "";
      items.forEach(b => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(b.nombre)}</td>
          <td>
            <button class="btn-action btn-ver-barbero btn-sm me-1" data-id="${b.id}" title="Ver"><i class="fa fa-eye"></i></button>
            <button class="btn-action btn-edit-barbero btn-sm me-1" data-id="${b.id}" title="Editar"><i class="fa fa-pen"></i></button>
            <button class="btn-action btn-delete-barbero btn-sm text-danger" data-id="${b.id}" title="Eliminar"><i class="fa fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      renderPagination(totalPages, page);
      attachRowListeners();
    } catch (err) {
      console.error("Error cargando barberos:", err);
      if (placeholder) {
        tbody.innerHTML = "";
        tbody.appendChild(placeholder);
        placeholder.innerHTML = `<td colspan="2" class="text-center text-danger">Error al cargar. Reintenta.</td>`;
      }
    }
  }

  function renderPagination(totalPages, activePage) {
    const pagination = document.getElementById(paginationId);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${activePage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#">«</a>`;
    prevLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage > 1) cargarBarberos(activePage - 1); });
    pagination.appendChild(prevLi);

    const maxButtons = 7;
    let start = Math.max(1, activePage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === activePage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (ev) => { ev.preventDefault(); cargarBarberos(i); });
      pagination.appendChild(li);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${activePage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
    nextLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage < totalPages) cargarBarberos(activePage + 1); });
    pagination.appendChild(nextLi);
  }

  function attachRowListeners() {
    // Delete
    document.querySelectorAll(".btn-delete-barbero").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (!confirm("Eliminar este barbero?")) return;
        try {
          const res = await fetch(`http://localhost:8080/api/barberos/${id}`, { method: "DELETE" });
          if (res.ok) cargarBarberos(currentPage);
          else alert("No se pudo eliminar");
        } catch (err) { console.error(err); alert("Error al eliminar"); }
      });
    });

    // Edit
    document.querySelectorAll(".btn-edit-barbero").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        try {
          const res = await fetch(`http://localhost:8080/api/barberos/${id}`);
          if (!res.ok) throw new Error();
          const b = await res.json();
          document.getElementById("barberoId").value = b.id ?? "";
          document.getElementById("barberoNombre").value = b.nombre ?? "";
          modalEl.querySelector(".modal-title").textContent = "Editar barbero";
          modal.show();
        } catch (err) {
          console.error("No se pudo cargar barbero", err);
          alert("Error al cargar barbero");
        }
      });
    });

    // View
    document.querySelectorAll(".btn-ver-barbero").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.location.href = `/barberos/${id}`; 
      });
    });
  }

  document.getElementById("formBarbero").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("barberoId").value || null;
    const payload = { nombre: document.getElementById("barberoNombre").value };

    try {
      const url = id ? `http://localhost:8080/api/barberos/${id}` : "http://localhost:8080/api/barberos";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        modal.hide();
        document.getElementById("formBarbero").reset();
        document.getElementById("barberoId").value = "";
        cargarBarberos(1);
      } else {
        const text = await res.text();
        console.error("Error guardando barbero:", text);
        alert("No se pudo guardar el barbero");
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar barbero");
    }
  });

  // Nuevo barbero button
  document.getElementById("btnNuevoBarbero").addEventListener("click", () => {
    document.getElementById("formBarbero").reset();
    document.getElementById("barberoId").value = "";
    modalEl.querySelector(".modal-title").textContent = "Nuevo barbero";
    modal.show();
  });

  cargarBarberos(1);
});
