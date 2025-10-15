package SIGEV.PlanTrabajo.Barbero;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/barberos")
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class BarberoController {

    @Autowired
    private BarberoRepository repo;

    @GetMapping
    public ResponseEntity<Page<Barbero>> all(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        Pageable p = PageRequest.of(page, size, Sort.by("nombre"));
        Page<Barbero> result = repo.findAll(p);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbero> one(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Barbero> create(@RequestBody Barbero b, UriComponentsBuilder uriBuilder) {
        Barbero saved = repo.save(b);
        URI uri = uriBuilder.path("http://localhost:8080/api/barberos/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(uri).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Barbero> update(@PathVariable Long id, @RequestBody Barbero input) {
        Optional<Barbero> opt = repo.findById(id);
        if (!opt.isPresent()) return ResponseEntity.notFound().build();
        Barbero prev = opt.get();
        prev.setNombre(input.getNombre() != null ? input.getNombre() : prev.getNombre());
        Barbero saved = repo.save(prev);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}