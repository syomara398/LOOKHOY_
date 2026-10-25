package pe.utp.lookhoy.model;

/** Estilo de una prenda u ocasión. */
public enum Style {
    CASUAL("Casual"), FORMAL("Formal"), DEPORTIVO("Deportivo");

    private final String label;
    Style(String label) { this.label = label; }
    public String label() { return label; }
    @Override public String toString() { return label; }
}
