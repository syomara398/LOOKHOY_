package pe.utp.lookhoy.model;

import com.google.common.base.Preconditions;
import org.apache.commons.lang3.StringUtils;

/** Prenda del clóset (inmutable). warmth: 1 = fresco, 2 = templado, 3 = abrigado. */
public record Garment(long id, long userId, String name, Category category,
                      Style style, int warmth, boolean favorite) {

    public Garment {
        Preconditions.checkArgument(StringUtils.isNotBlank(name), "El nombre de la prenda es obligatorio");
        Preconditions.checkArgument(name.strip().length() <= 60, "El nombre admite máximo 60 caracteres");
        Preconditions.checkNotNull(category, "category");
        Preconditions.checkNotNull(style, "style");
        Preconditions.checkArgument(warmth >= 1 && warmth <= 3, "El abrigo debe estar entre 1 y 3");
        name = name.strip();
    }

    public Garment withId(long newId) { return new Garment(newId, userId, name, category, style, warmth, favorite); }
    public Garment withFavorite(boolean fav) { return new Garment(id, userId, name, category, style, warmth, fav); }
}
