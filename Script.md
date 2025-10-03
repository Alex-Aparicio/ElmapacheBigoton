CREATE DATABASE BarberiaMapache;
USE BarberiaMapache;

CREATE TABLE Barbero (
    id_barbero INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(15)
);

CREATE TABLE Servicio (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    costo DECIMAL(8,2) NOT NULL
);

CREATE TABLE Cita (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    id_barbero INT,
    id_cliente INT,
    id_servicio INT,
    FOREIGN KEY (id_barbero) REFERENCES Barbero(id_barbero),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_servicio) REFERENCES Servicio(id_servicio)
);
