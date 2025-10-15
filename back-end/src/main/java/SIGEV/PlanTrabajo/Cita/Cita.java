package SIGEV.PlanTrabajo.Cita;

import SIGEV.PlanTrabajo.Barbero.Barbero;
import SIGEV.PlanTrabajo.Servicio.Servicio;
import SIGEV.PlanTrabajo.Sucursal.Sucursal;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cita")
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;

    private String hora;

    private String cliente;

    private String status; 

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "barbero_id")
    private Barbero barbero;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "servicio_id")
    private Servicio servicio;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;



    public Cita() {}

    // getters / setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getHora() { return hora; }
    public void setHora(String hora) { this.hora = hora; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Barbero getBarbero() { return barbero; }
    public void setBarbero(Barbero barbero) { this.barbero = barbero; }

    public Servicio getServicio() { return servicio; }
    public void setServicio(Servicio servicio) { this.servicio = servicio; }

    public Sucursal getSucursal() { return sucursal; }
    public void setSucursal(Sucursal sucursal) { this.sucursal = sucursal; }
}