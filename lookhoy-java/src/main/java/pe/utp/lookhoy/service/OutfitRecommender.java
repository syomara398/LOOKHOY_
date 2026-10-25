package pe.utp.lookhoy.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;
import pe.utp.lookhoy.model.Suggestion;
import pe.utp.lookhoy.model.WeatherInfo;

/**
 * Motor de recomendación (puro, sin E/S: fácil de probar con TDD).
 * Puntúa cada prenda por estilo de la ocasión + abrigo según sensación térmica + favorito,
 * y recorre las combinaciones con un "odómetro" (variant = 0 es la mejor).
 */
public class OutfitRecommender {
    private static final int DEFAULT_FEELS = 22;
    private final OccasionStyleResolver resolver;

    public OutfitRecommender(OccasionStyleResolver resolver) { this.resolver = resolver; }

    static int targetWarmth(int feelsC) {
        if (feelsC >= 23) return 1;
        if (feelsC >= 17) return 2;
        return 3;
    }

    private static double score(Garment g, List<Style> styles, int target, double weight) {
        int i = styles.indexOf(g.style());
        double styleScore = i == 0 ? 3 : i == 1 ? 1.8 : 0;
        double warmthScore = weight * (2 - Math.abs(g.warmth() - target));
        return styleScore + warmthScore + (g.favorite() ? 0.4 : 0);
    }

    public Suggestion suggest(List<Garment> closet, String occasion, WeatherInfo weather, int variant) {
        List<Style> styles = resolver.stylesFor(occasion);
        int feels = weather != null ? weather.feelsC() : DEFAULT_FEELS;
        int target = targetWarmth(feels);
        boolean needsCoat = feels < 19 || (weather != null && weather.rainy());

        Set<Category> wanted = EnumSet.allOf(Category.class);
        if (!needsCoat) wanted.remove(Category.ABRIGO);

        List<Category> missing = new ArrayList<>();
        List<List<Garment>> pools = new ArrayList<>();
        for (Category cat : wanted) {
            double weight = cat == Category.CALZADO ? 0.5 : 1.0;
            int catTarget = cat == Category.ABRIGO ? (feels < 14 ? 3 : 2) : target;
            List<Garment> candidates = closet.stream().filter(g -> g.category() == cat).toList();
            if (candidates.isEmpty()) { missing.add(cat); continue; }
            List<Garment> ranked = candidates.stream()
                    .sorted(Comparator.comparingDouble((Garment g) -> score(g, styles, catTarget, weight)).reversed())
                    .toList();
            double best = score(ranked.get(0), styles, catTarget, weight);
            pools.add(ranked.stream().filter(g -> score(g, styles, catTarget, weight) >= best - 2.5).toList());
        }

        int combos = pools.stream().mapToInt(List::size).reduce(1, (a, b) -> a * b);
        int v = ((variant % combos) + combos) % combos;
        List<Garment> pieces = new ArrayList<>();
        for (List<Garment> pool : pools) {
            pieces.add(pool.get(v % pool.size()));
            v /= pool.size();
        }

        List<String> notes = new ArrayList<>();
        if (weather != null) {
            if (weather.rainy()) notes.add("Hay probabilidad de lluvia (" + weather.rainProb() + "%): conviene llevar abrigo.");
            else if (feels < 19) notes.add("Se siente fresco (" + feels + " °C): suma una capa de abrigo.");
            else if (feels >= 27) notes.add("Hace calor (" + feels + " °C): elegimos prendas frescas.");
        } else {
            notes.add("No hay datos del clima; armamos el outfit para un día templado.");
        }
        if (!missing.isEmpty()) {
            List<String> names = missing.stream().map(c -> c.label().toLowerCase()).toList();
            notes.add("Te falta " + String.join(" y ", names) + " en tu clóset para completar el look.");
        }
        return new Suggestion(styles.get(0).label() + " para " + occasion, pieces, missing, notes, combos);
    }
}
