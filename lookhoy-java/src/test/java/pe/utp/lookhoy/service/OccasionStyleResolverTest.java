package pe.utp.lookhoy.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import pe.utp.lookhoy.model.Style;

class OccasionStyleResolverTest {
    private final OccasionStyleResolver r = new OccasionStyleResolver();

    @Test void citaYEntrevistaSonFormales() {
        assertEquals(List.of(Style.FORMAL, Style.CASUAL), r.stylesFor("Cita"));
        assertEquals(List.of(Style.FORMAL, Style.CASUAL), r.stylesFor("Reunión de trabajo"));
    }

    @Test void gimnasioEsDeportivo() { assertEquals(Style.DEPORTIVO, r.stylesFor("Gimnasio").get(0)); }
    @Test void feriaEsCasual() { assertEquals(Style.CASUAL, r.stylesFor("Feria").get(0)); }
    @Test void desconocidoEsCasual() { assertEquals(List.of(Style.CASUAL), r.stylesFor("Algo raro")); }
}
