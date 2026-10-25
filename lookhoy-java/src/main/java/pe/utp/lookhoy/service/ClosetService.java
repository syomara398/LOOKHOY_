package pe.utp.lookhoy.service;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableListMultimap;
import com.google.common.collect.Multimaps;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.utp.lookhoy.dao.GarmentDao;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;

/** Casos de uso del clóset: agregar, listar, favorito, eliminar. */
public class ClosetService {
    private static final Logger log = LoggerFactory.getLogger(ClosetService.class);
    private final GarmentDao garments;

    public ClosetService(GarmentDao garments) { this.garments = garments; }

    public Garment add(long userId, String name, Category category, Style style, int warmth) {
        Garment saved = garments.save(new Garment(0, userId, name, category, style, warmth, false));
        log.info("Prenda agregada id={} usuario={}", saved.id(), userId);
        return saved;
    }

    public List<Garment> list(long userId) { return ImmutableList.copyOf(garments.findByUser(userId)); }

    /** Agrupa el clóset por categoría usando Multimaps de Guava. */
    public ImmutableListMultimap<Category, Garment> byCategory(long userId) {
        return Multimaps.index(garments.findByUser(userId), Garment::category);
    }

    public void toggleFavorite(long userId, long garmentId) {
        garments.findById(userId, garmentId).ifPresent(g -> garments.update(g.withFavorite(!g.favorite())));
    }

    public boolean remove(long userId, long garmentId) {
        boolean ok = garments.delete(userId, garmentId);
        if (ok) log.info("Prenda eliminada id={} usuario={}", garmentId, userId);
        return ok;
    }
}
