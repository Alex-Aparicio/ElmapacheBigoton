package SIGEV.PlanTrabajo.Sucursal;

import jakarta.persistence.*;

@Entity 
@Table(name = "sucursal") 

public class Sucursal { 
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    
    private Long id; 
    private String direccion; 
    
    public Sucursal() {} 
    
    public Sucursal(String direccion) { 
        this.direccion = direccion; } 
        
    public Long getId()
    { return id; } 
    
    public void setId(Long id) { 
    this.id = id; } 
    
    public String getDireccion() { 
    return direccion; } 
    
    public void setDireccion(String direccion) { 
    this.direccion = direccion; } }