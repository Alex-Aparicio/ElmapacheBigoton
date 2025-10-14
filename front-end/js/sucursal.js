$(function () {
    let currentPage = 1;
    const pageSize = 10;

    const tablaId = "tablaSucursales";
    const paginationId = "paginationSucursales";

    const modalEl = document.getElementById("modalSucursal");
    const modal = new bootstrap.Modal(modalEl);

    function escapeHtml(str) {
        return String(str ?? "").replace(/[&<>"'`=\/]/g, s =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[s]
        );
    }

    // === Cargar sucursales ===
    async function cargarSucursales(page = 1) {
        const tbody = document.getElementById(tablaId);
        const placeholder = document.getElementById("placeholder-sucursal");

        try {
            const res = await fetch(`http://localhost:8080/api/sucursales?page=${page - 1}&size=${pageSize}`);
            if (!res.ok) throw new Error("Error al obtener sucursales");

            const data = await res.json();
            const items = data.content ?? data;
            const totalPages = data.totalPages ?? Math.ceil((data.length || items.length) / pageSize);

            if (!items || items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No hay sucursales</td></tr>`;
                renderPagination(totalPages, page);
                return;
            }

            tbody.innerHTML = "";
            items.forEach(s => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${escapeHtml(s.direccion ?? '')}</td>
                    <td class="text-center">
                        <button class="btn-action btn-edit-sucursal btn-sm me-1" data-id="${s.id}" title="Editar">
                            <i class="fa fa-pen"></i>
                        </button>
                        <button class="btn-action btn-delete-sucursal btn-sm text-danger" data-id="${s.id}" title="Eliminar">
                            <i class="fa fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            renderPagination(totalPages, page);
            attachRowListeners();

        } catch (err) {
            console.error("Error cargando sucursales:", err);
            tbody.innerHTML = `<tr><td colspan="2" class="text-center text-danger">Error al cargar. Reintenta.</td></tr>`;
        }
    }

    // === Render paginación ===
    function renderPagination(totalPages, activePage) {
        const pagination = document.getElementById(paginationId);
        pagination.innerHTML = "";
        if (totalPages <= 1) return;

        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${activePage === 1 ? "disabled" : ""}`;
        prevLi.innerHTML = `<a class="page-link" href="#">«</a>`;
        prevLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (activePage > 1) cargarSucursales(activePage - 1);
        });
        pagination.appendChild(prevLi);

        const maxButtons = 7;
        let start = Math.max(1, activePage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

        for (let i = start; i <= end; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === activePage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", (ev) => {
                ev.preventDefault();
                cargarSucursales(i);
            });
            pagination.appendChild(li);
        }

        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${activePage === totalPages ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
        nextLi.addEventListener("click", (e) => {
            e.preventDefault();
            if (activePage < totalPages) cargarSucursales(activePage + 1);
        });
        pagination.appendChild(nextLi);
    }

    // === Eventos de botones ===
    function attachRowListeners() {
        document.querySelectorAll(".btn-delete-sucursal").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (!confirm("¿Eliminar esta sucursal?")) return;
                try {
                    const res = await fetch(`http://localhost:8080/api/sucursales/${id}`, { method: "DELETE" });
                    if (res.ok) cargarSucursales(currentPage);
                    else alert("No se pudo eliminar");
                } catch (err) {
                    console.error(err);
                    alert("Error al eliminar");
                }
            });
        });

        document.querySelectorAll(".btn-edit-sucursal").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                try {
                    const res = await fetch(`http://localhost:8080/api/sucursales/${id}`);
                    if (!res.ok) throw new Error();
                    const s = await res.json();
                    document.getElementById("sucursalId").value = s.id ?? "";
                    document.getElementById("direccion").value = s.direccion ?? "";
                    modalEl.querySelector(".modal-title").textContent = "Editar sucursal";
                    modal.show();
                } catch (err) {
                    console.error("No se pudo cargar la sucursal", err);
                    alert("Error al cargar sucursal");
                }
            });
        });
    }

    // === Guardar/Actualizar sucursal ===
    document.getElementById("formSucursal").addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("sucursalId").value || null;
        const payload = { direccion: document.getElementById("direccion").value };

        try {
            const url = id ? `http://localhost:8080/api/sucursales/${id}` : "http://localhost:8080/api/sucursales";
            const method = id ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                modal.hide();
                document.getElementById("formSucursal").reset();
                document.getElementById("sucursalId").value = "";
                cargarSucursales(1);
            } else {
                const text = await res.text();
                console.error("Error guardando sucursal:", text);
                alert("No se pudo guardar la sucursal");
            }

        } catch (err) {
            console.error(err);
            alert("Error al guardar sucursal");
        }
    });

    // === Nuevo registro ===
    document.getElementById("btnNuevaSucursal").addEventListener("click", () => {
        document.getElementById("formSucursal").reset();
        document.getElementById("sucursalId").value = "";
        modalEl.querySelector(".modal-title").textContent = "Nueva sucursal";
        modal.show();
    });

    cargarSucursales(1);
});
