package SIGEV.PlanTrabajo.Barbero;

import jakarta.persistence.*;

@Entity
@Table(name = "barbero")
public class Barbero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    public Barbero() {}

    public Barbero(String nombre) { this.nombre = nombre; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}