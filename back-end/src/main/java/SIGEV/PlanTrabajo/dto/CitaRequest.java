package SIGEV.PlanTrabajo.dto;

import java.time.LocalDate;

public class CitaRequest {
    private LocalDate fecha;
    private String hora;
    private String cliente;
    private Long barberoId;
    private Long servicioId;
    private Long sucursalId;

    public CitaRequest() {}

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public Long getBarberoId() { return barberoId; }
    public void setBarberoId(Long barberoId) { this.barberoId = barberoId; }

    public Long getServicioId() { return servicioId; }
    public void setServicioId(Long servicioId) { this.servicioId = servicioId; }

    public Long getSucursalId() { return sucursalId; }
    public void setSucursalId(Long sucursalId) { this.sucursalId = sucursalId; }
}
