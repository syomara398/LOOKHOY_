package pe.utp.lookhoy.model;

/** Categoría de una prenda. El orden define el orden de armado del outfit. */
public enum Category {
    ARRIBA("Arriba"), ABAJO("Abajo"), CALZADO("Calzado"), ABRIGO("Abrigo");

    private final String label;
    Category(String label) { this.label = label; }
    public String label() { return label; }
    @Override public String toString() { return label; }
}
