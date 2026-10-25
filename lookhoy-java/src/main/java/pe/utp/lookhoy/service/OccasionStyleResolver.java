package pe.utp.lookhoy.service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import pe.utp.lookhoy.model.Style;

/** Traduce el texto de una ocasión a estilos preferidos (del más al menos importante). */
public class OccasionStyleResolver {
    private static final Pattern FORMAL = Pattern.compile("entrevista|trabajo|reunion|boda|graduacion|\\bcita\\b|formal|ceremonia|aniversario");
    private static final Pattern SPORT = Pattern.compile("gym|gimnasio|deporte|correr|entren|futbol");
    private static final Pattern OUTING = Pattern.compile("feria|paseo|caminata|playa|viaje");

    public List<Style> stylesFor(String occasion) {
        String o = Normalizer.normalize(occasion == null ? "" : occasion, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        if (FORMAL.matcher(o).find()) return List.of(Style.FORMAL, Style.CASUAL);
        if (SPORT.matcher(o).find()) return List.of(Style.DEPORTIVO, Style.CASUAL);
        if (OUTING.matcher(o).find()) return List.of(Style.CASUAL, Style.DEPORTIVO);
        return List.of(Style.CASUAL);
    }
}
