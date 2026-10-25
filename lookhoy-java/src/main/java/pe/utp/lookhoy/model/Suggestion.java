package pe.utp.lookhoy.model;

import java.util.List;

/** Resultado del recomendador: prendas, categorías faltantes y notas para el usuario. */
public record Suggestion(String title, List<Garment> pieces, List<Category> missing,
                         List<String> notes, int combos) { }
