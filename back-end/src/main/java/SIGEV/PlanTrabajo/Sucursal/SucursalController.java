package SIGEV.PlanTrabajo.Sucursal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/sucursales")
@CrossOrigin(origins = { "http://127.0.0.1:5500", "http://localhost:5500" })

public class SucursalController {

    @Autowired
    private SucursalRepository repo;

    @GetMapping
    public ResponseEntity<Page<Sucursal>> all(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable p = PageRequest.of(page, size, Sort.by("direccion"));
        Page<Sucursal> result = repo.findAll(p);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> one(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sucursal> create(@RequestBody Sucursal b, UriComponentsBuilder uriBuilder) {
        Sucursal saved = repo.save(b);
        URI uri = uriBuilder.path("http://localhost:8080/api/sucursales/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(uri).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sucursal> update(@PathVariable Long id, @RequestBody Sucursal input) {
        Optional<Sucursal> opt = repo.findById(id);
        if (!opt.isPresent())
            return ResponseEntity.notFound().build();
        Sucursal prev = opt.get();
        prev.setDireccion(input.getDireccion() != null ? input.getDireccion() : prev.getDireccion());
        Sucursal saved = repo.save(prev);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}