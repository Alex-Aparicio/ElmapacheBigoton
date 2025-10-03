$(function () {
  let currentPage = 1;
  const pageSize = 10;

  const tablaId = "tablaServicios";
  const paginationId = "paginationServicios";

  const modalEl = document.getElementById("modalServicio");
  const modal = new bootstrap.Modal(modalEl);

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[s];
    });
  }

  function formatCurrency(v) {
    if (v == null || v === "") return "";
    const n = Number(v);
    if (isNaN(n)) return v;
    return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  async function cargarServicios(page = 1) {
    const tbody = document.getElementById(tablaId);
    const placeholder = document.getElementById("placeholder-servicio");
    try {
      const res = await fetch(`http://localhost:8080/api/servicios?page=${page - 1}&size=${pageSize}`);
      if (!res.ok) throw new Error("Error al obtener servicios");
      const data = await res.json();
      const items = data.content ?? data;
      const totalPages = data.totalPages ?? Math.ceil((data.length || items.length) / pageSize);

      if (!items || items.length === 0) {
        if (placeholder) {
          tbody.innerHTML = "";
          tbody.appendChild(placeholder);
          placeholder.innerHTML = `<td colspan="4" class="text-center text-muted">No hay servicios</td>`;
        } else {
          tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay servicios</td></tr>`;
        }
        renderPagination(totalPages, page);
        return;
      }

      tbody.innerHTML = "";
      items.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(s.nombre)}</td>
          <td>${escapeHtml(s.descripcion ?? '')}</td>
          <td class="text-end">${formatCurrency(s.costo)}</td>
          <td>
            <button class="btn-action btn-ver-servicio btn-sm me-1" data-id="${s.id}" title="Ver"><i class="fa fa-eye"></i></button>
            <button class="btn-action btn-edit-servicio btn-sm me-1" data-id="${s.id}" title="Editar"><i class="fa fa-pen"></i></button>
            <button class="btn-action btn-delete-servicio btn-sm text-danger" data-id="${s.id}" title="Eliminar"><i class="fa fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      renderPagination(totalPages, page);
      attachRowListeners();
    } catch (err) {
      console.error("Error cargando servicios:", err);
      if (placeholder) {
        tbody.innerHTML = "";
        tbody.appendChild(placeholder);
        placeholder.innerHTML = `<td colspan="4" class="text-center text-danger">Error al cargar. Reintenta.</td>`;
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
    prevLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage > 1) cargarServicios(activePage - 1); });
    pagination.appendChild(prevLi);

    const maxButtons = 7;
    let start = Math.max(1, activePage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === activePage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (ev) => { ev.preventDefault(); cargarServicios(i); });
      pagination.appendChild(li);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${activePage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
    nextLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage < totalPages) cargarServicios(activePage + 1); });
    pagination.appendChild(nextLi);
  }

  function attachRowListeners() {
    document.querySelectorAll(".btn-delete-servicio").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (!confirm("Eliminar este servicio?")) return;
        try {
          const res = await fetch(`http://localhost:8080/api/servicios/${id}`, { method: "DELETE" });
          if (res.ok) cargarServicios(currentPage);
          else alert("No se pudo eliminar");
        } catch (err) { console.error(err); alert("Error al eliminar"); }
      });
    });

    document.querySelectorAll(".btn-edit-servicio").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        try {
          const res = await fetch(`http://localhost:8080/api/servicios/${id}`);
          if (!res.ok) throw new Error();
          const s = await res.json();
          document.getElementById("servicioId").value = s.id ?? "";
          document.getElementById("nombre").value = s.nombre ?? "";
          document.getElementById("descripcion").value = s.descripcion ?? "";
          document.getElementById("costo").value = s.costo ?? "";
          modalEl.querySelector(".modal-title").textContent = "Editar servicio";
          modal.show();
        } catch (err) {
          console.error("No se pudo cargar servicio", err);
          alert("Error al cargar servicio");
        }
      });
    });

    document.querySelectorAll(".btn-ver-servicio").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        window.location.href = `/servicios/${id}`;
      });
    });
  }

  document.getElementById("formServicio").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("servicioId").value || null;
    const payload = {
      nombre: document.getElementById("nombre").value,
      descripcion: document.getElementById("descripcion").value,
      costo: parseFloat(document.getElementById("costo").value)
    };

    try {
      const url = id ? `http://localhost:8080/api/servicios/${id}` : "http://localhost:8080/api/servicios";
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        modal.hide();
        document.getElementById("formServicio").reset();
        document.getElementById("servicioId").value = "";
        cargarServicios(1);
      } else {
        const text = await res.text();
        console.error("Error guardando servicio:", text);
        alert("No se pudo guardar el servicio");
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar servicio");
    }
  });

  document.getElementById("btnNuevoServicio").addEventListener("click", () => {
    document.getElementById("formServicio").reset();
    document.getElementById("servicioId").value = "";
    modalEl.querySelector(".modal-title").textContent = "Nuevo servicio";
    modal.show();
  });
  cargarServicios(1);
});