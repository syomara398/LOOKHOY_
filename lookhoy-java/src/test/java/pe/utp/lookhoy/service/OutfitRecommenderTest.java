package pe.utp.lookhoy.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Garment;
import pe.utp.lookhoy.model.Style;
import pe.utp.lookhoy.model.Suggestion;
import pe.utp.lookhoy.model.WeatherInfo;

class OutfitRecommenderTest {
    private final OutfitRecommender rec = new OutfitRecommender(new OccasionStyleResolver());

    private static Garment g(long id, String n, Category c, Style s, int w) {
        return new Garment(id, 1, n, c, s, w, false);
    }

    private static WeatherInfo weather(int feels, boolean rainy) {
        return new WeatherInfo("Ica", "Perú", feels, feels, 50, 5, 0, "Despejado", rainy ? 80 : 0, rainy);
    }

    private final List<Garment> closet = List.of(
            g(1, "Polo", Category.ARRIBA, Style.CASUAL, 1),
            g(2, "Camisa", Category.ARRIBA, Style.FORMAL, 1),
            g(3, "Jean", Category.ABAJO, Style.CASUAL, 2),
            g(4, "Zapatillas", Category.CALZADO, Style.CASUAL, 1),
            g(5, "Casaca", Category.ABRIGO, Style.CASUAL, 2));

    @Test void ocasionFormalPrefiereCamisa() {
        Suggestion s = rec.suggest(closet, "Entrevista de trabajo", weather(25, false), 0);
        assertTrue(s.pieces().stream().anyMatch(p -> p.name().equals("Camisa")));
    }

    @Test void conCalorNoIncluyeAbrigo() {
        Suggestion s = rec.suggest(closet, "Feria", weather(28, false), 0);
        assertTrue(s.pieces().stream().noneMatch(p -> p.category() == Category.ABRIGO));
    }

    @Test void conFrioOLluviaIncluyeAbrigo() {
        assertTrue(rec.suggest(closet, "Feria", weather(15, false), 0).pieces().stream().anyMatch(p -> p.category() == Category.ABRIGO));
        assertTrue(rec.suggest(closet, "Feria", weather(25, true), 0).pieces().stream().anyMatch(p -> p.category() == Category.ABRIGO));
    }

    @Test void avisaLasCategoriasFaltantes() {
        List<Garment> sinCalzado = closet.stream().filter(p -> p.category() != Category.CALZADO).toList();
        Suggestion s = rec.suggest(sinCalzado, "Feria", weather(25, false), 0);
        assertEquals(List.of(Category.CALZADO), s.missing());
        assertTrue(s.notes().stream().anyMatch(n -> n.contains("calzado")));
    }

    @Test void otraSugerenciaCambiaLaCombinacionYDaLaVuelta() {
        List<Garment> conDosPolos = new java.util.ArrayList<>(closet);
        conDosPolos.add(g(6, "Polo negro", Category.ARRIBA, Style.CASUAL, 1));
        WeatherInfo w = weather(25, false);
        Suggestion a = rec.suggest(conDosPolos, "Instituto", w, 0);
        assertEquals(2, a.combos());
        Suggestion b = rec.suggest(conDosPolos, "Instituto", w, 1);
        assertNotEquals(a.pieces(), b.pieces());
        assertEquals(a.pieces(), rec.suggest(conDosPolos, "Instituto", w, a.combos()).pieces());
    }

    @Test void sinClimaUsaDiaTemplado() {
        Suggestion s = rec.suggest(closet, "Feria", null, 0);
        assertTrue(s.notes().get(0).contains("No hay datos del clima"));
    }

    @Test void closetVacioNoFalla() {
        assertTrue(rec.suggest(List.of(), "Feria", null, 0).pieces().isEmpty());
    }
}
