package pe.utp.lookhoy.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pe.utp.lookhoy.dao.InMemoryGarmentDao;
import pe.utp.lookhoy.model.Category;
import pe.utp.lookhoy.model.Style;

class ClosetServiceTest {
    private ClosetService closet;

    @BeforeEach void setUp() { closet = new ClosetService(new InMemoryGarmentDao()); }

    @Test void agregaYListaSoloLasPrendasDelUsuario() {
        closet.add(1, "Polo blanco", Category.ARRIBA, Style.CASUAL, 1);
        closet.add(2, "Jean azul", Category.ABAJO, Style.CASUAL, 2);
        assertEquals(1, closet.list(1).size());
        assertEquals("Polo blanco", closet.list(1).get(0).name());
    }

    @Test void rechazaNombreVacioYAbrigoFueraDeRango() {
        assertThrows(IllegalArgumentException.class, () -> closet.add(1, "  ", Category.ARRIBA, Style.CASUAL, 1));
        assertThrows(IllegalArgumentException.class, () -> closet.add(1, "Polo", Category.ARRIBA, Style.CASUAL, 5));
    }

    @Test void favoritoSeAlterna() {
        long id = closet.add(1, "Polo", Category.ARRIBA, Style.CASUAL, 1).id();
        closet.toggleFavorite(1, id);
        assertTrue(closet.list(1).get(0).favorite());
        closet.toggleFavorite(1, id);
        assertFalse(closet.list(1).get(0).favorite());
    }

    @Test void nadiePuedeEliminarPrendasAjenas() {
        long id = closet.add(1, "Polo", Category.ARRIBA, Style.CASUAL, 1).id();
        assertFalse(closet.remove(2, id));
        assertTrue(closet.remove(1, id));
        assertTrue(closet.list(1).isEmpty());
    }

    @Test void agrupaPorCategoria() {
        closet.add(1, "Polo", Category.ARRIBA, Style.CASUAL, 1);
        closet.add(1, "Camisa", Category.ARRIBA, Style.FORMAL, 1);
        closet.add(1, "Jean", Category.ABAJO, Style.CASUAL, 2);
        assertEquals(2, closet.byCategory(1).get(Category.ARRIBA).size());
    }
}
