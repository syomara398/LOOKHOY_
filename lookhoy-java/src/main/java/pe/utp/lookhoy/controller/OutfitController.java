package pe.utp.lookhoy.controller;

import pe.utp.lookhoy.model.Suggestion;
import pe.utp.lookhoy.model.WeatherInfo;
import pe.utp.lookhoy.service.ClosetService;
import pe.utp.lookhoy.service.OutfitRecommender;
import pe.utp.lookhoy.service.WeatherException;
import pe.utp.lookhoy.service.WeatherProvider;

/** Coordina clima + clóset + recomendador para la pantalla de outfits. */
public class OutfitController {
    private final ClosetService closet;
    private final OutfitRecommender recommender;
    private final WeatherProvider weather;
    private final SessionContext session;

    public OutfitController(ClosetService closet, OutfitRecommender recommender,
                            WeatherProvider weather, SessionContext session) {
        this.closet = closet;
        this.recommender = recommender;
        this.weather = weather;
        this.session = session;
    }

    public WeatherInfo weatherFor(String city) throws WeatherException { return weather.fetch(city); }

    public Suggestion suggest(String occasion, WeatherInfo w, int variant) {
        return recommender.suggest(closet.list(session.requireUserId()), occasion, w, variant);
    }
}
