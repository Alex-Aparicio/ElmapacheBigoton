package SIGEV.PlanTrabajo.Cita;

import SIGEV.PlanTrabajo.dto.CitaRequest;
import SIGEV.PlanTrabajo.Barbero.Barbero;
import SIGEV.PlanTrabajo.Servicio.Servicio;
import SIGEV.PlanTrabajo.Barbero.BarberoRepository;
import SIGEV.PlanTrabajo.Servicio.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class CitaController {

    @Autowired
    private CitaRepository citaRepo;

    @Autowired
    private BarberoRepository barberoRepo;

    @Autowired
    private ServicioRepository servicioRepo;

    @GetMapping
    public ResponseEntity<Page<Cita>> findAll(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fecha", "hora"));
        Page<Cita> citas = citaRepo.findAll(p);
        return ResponseEntity.ok(citas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cita> findById(@PathVariable Long id) {
        Optional<Cita> opt = citaRepo.findById(id);
        return opt.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CitaRequest req, UriComponentsBuilder uriBuilder) {
        if (req.getBarberoId() == null || req.getServicioId() == null) {
            return ResponseEntity.unprocessableEntity().body("barberoId y servicioId son requeridos");
        }

        Optional<Barbero> bOpt = barberoRepo.findById(req.getBarberoId());
        Optional<Servicio> sOpt = servicioRepo.findById(req.getServicioId());
        if (!bOpt.isPresent() || !sOpt.isPresent()) {
            return ResponseEntity.unprocessableEntity().body("Barbero o Servicio no existen");
        }

        Cita c = new Cita();
        c.setFecha(req.getFecha());
        c.setHora(req.getHora());
        c.setCliente(req.getCliente());
        c.setBarbero(bOpt.get());
        c.setServicio(sOpt.get());
        c.setStatus("pendiente");

        Cita saved = citaRepo.save(c);
        URI uri = uriBuilder.path("/api/citas/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(uri).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CitaRequest req) {
        Optional<Cita> opt = citaRepo.findById(id);
        if (!opt.isPresent()) return ResponseEntity.notFound().build();
        Cita prev = opt.get();

        if (req.getFecha() != null) prev.setFecha(req.getFecha());
        if (req.getHora() != null) prev.setHora(req.getHora());
        if (req.getCliente() != null) prev.setCliente(req.getCliente());

        if (req.getBarberoId() != null) {
            barberoRepo.findById(req.getBarberoId()).ifPresent(prev::setBarbero);
        }
        if (req.getServicioId() != null) {
            servicioRepo.findById(req.getServicioId()).ifPresent(prev::setServicio);
        }
        // status lo dejamos para endpoints/cron jobs separados si es necesario

        Cita saved = citaRepo.save(prev);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!citaRepo.existsById(id)) return ResponseEntity.notFound().build();
        citaRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
