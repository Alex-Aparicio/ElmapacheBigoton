package SIGEV.PlanTrabajo.Servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/servicios")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class ServicioController {

    @Autowired
    private ServicioRepository repo;

    @GetMapping
    public ResponseEntity<Page<Servicio>> all(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("nombre"));
        Page<Servicio> result = repo.findAll(p);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> one(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Servicio> create(@RequestBody Servicio s, UriComponentsBuilder uriBuilder) {
        Servicio saved = repo.save(s);
        URI uri = uriBuilder.path("http://localhost:8080/api/servicios/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(uri).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> update(@PathVariable Long id, @RequestBody Servicio input) {
        Optional<Servicio> opt = repo.findById(id);
        if (!opt.isPresent()) return ResponseEntity.notFound().build();
        Servicio prev = opt.get();
        prev.setNombre(input.getNombre() != null ? input.getNombre() : prev.getNombre());
        prev.setDescripcion(input.getDescripcion() != null ? input.getDescripcion() : prev.getDescripcion());
        prev.setCosto(input.getCosto() != null ? input.getCosto() : prev.getCosto());
        Servicio saved = repo.save(prev);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
