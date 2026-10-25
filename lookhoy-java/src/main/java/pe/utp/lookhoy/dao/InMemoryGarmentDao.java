package pe.utp.lookhoy.dao;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import pe.utp.lookhoy.model.Garment;

/** Implementación en memoria; se usa en las pruebas unitarias (TDD). */
public class InMemoryGarmentDao implements GarmentDao {
    private final List<Garment> data = new CopyOnWriteArrayList<>();
    private final AtomicLong seq = new AtomicLong();

    @Override public Garment save(Garment g) {
        Garment saved = g.withId(seq.incrementAndGet());
        data.add(saved);
        return saved;
    }

    @Override public List<Garment> findByUser(long userId) {
        List<Garment> out = new ArrayList<>();
        for (Garment g : data) if (g.userId() == userId) out.add(g);
        return out;
    }

    @Override public Optional<Garment> findById(long userId, long id) {
        return data.stream().filter(g -> g.id() == id && g.userId() == userId).findFirst();
    }

    @Override public boolean delete(long userId, long id) {
        return data.removeIf(g -> g.id() == id && g.userId() == userId);
    }

    @Override public void update(Garment g) {
        for (int i = 0; i < data.size(); i++) {
            Garment cur = data.get(i);
            if (cur.id() == g.id() && cur.userId() == g.userId()) { data.set(i, g); return; }
        }
    }
}
