package pe.utp.lookhoy.service;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.utp.lookhoy.model.WeatherInfo;
import pe.utp.lookhoy.security.InputValidator;

/** Clima real con Open-Meteo (gratuito, sin API key). Solo HTTPS y con timeouts. */
public class OpenMeteoWeatherProvider implements WeatherProvider {
    private static final Logger log = LoggerFactory.getLogger(OpenMeteoWeatherProvider.class);
    private static final String GEO = "https://geocoding-api.open-meteo.com/v1/search";
    private static final String FORECAST = "https://api.open-meteo.com/v1/forecast";
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    @Override public WeatherInfo fetch(String city) throws WeatherException {
        if (!InputValidator.isValidCity(city)) throw new WeatherException("Escribe un nombre de ciudad válido.");
        try {
            JsonObject geo = getJson(GEO + "?name=" + URLEncoder.encode(city.strip(), StandardCharsets.UTF_8)
                    + "&count=1&language=es&format=json");
            JsonArray results = geo.has("results") ? geo.getAsJsonArray("results") : new JsonArray();
            if (results.isEmpty()) throw new WeatherException("No encontramos \"" + city.strip() + "\". Prueba con otra ciudad.");
            JsonObject hit = results.get(0).getAsJsonObject();

            JsonObject data = getJson(FORECAST + "?latitude=" + hit.get("latitude").getAsDouble()
                    + "&longitude=" + hit.get("longitude").getAsDouble()
                    + "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code"
                    + "&daily=precipitation_probability_max&timezone=auto&forecast_days=1");
            JsonObject c = data.getAsJsonObject("current");
            int code = c.get("weather_code").getAsInt();
            int rainProb = 0;
            if (data.has("daily")) {
                JsonElement e = data.getAsJsonObject("daily").getAsJsonArray("precipitation_probability_max").get(0);
                rainProb = e.isJsonNull() ? 0 : e.getAsInt();
            }
            boolean rainy = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95 || rainProb >= 60;
            return new WeatherInfo(hit.get("name").getAsString(),
                    hit.has("country") ? hit.get("country").getAsString() : "",
                    (int) Math.round(c.get("temperature_2m").getAsDouble()),
                    (int) Math.round(c.get("apparent_temperature").getAsDouble()),
                    (int) Math.round(c.get("relative_humidity_2m").getAsDouble()),
                    (int) Math.round(c.get("wind_speed_10m").getAsDouble()),
                    code, describe(code), rainProb, rainy);
        } catch (IOException e) {
            log.warn("Fallo de red al consultar el clima: {}", e.getMessage());
            throw new WeatherException("No se pudo obtener el clima. Revisa tu conexión.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new WeatherException("Consulta de clima interrumpida.", e);
        } catch (RuntimeException e) {
            log.warn("Respuesta inesperada del servicio de clima", e);
            throw new WeatherException("El servicio de clima devolvió datos inesperados.", e);
        }
    }

    private JsonObject getJson(String url) throws IOException, InterruptedException, WeatherException {
        HttpRequest req = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(10)).GET().build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) throw new WeatherException("El servicio de clima respondió " + res.statusCode() + ".");
        return JsonParser.parseString(res.body()).getAsJsonObject();
    }

    /** Códigos WMO a descripción en español. */
    static String describe(int code) {
        if (code == 0) return "Despejado";
        if (code == 1) return "Mayormente despejado";
        if (code == 2) return "Parcialmente nublado";
        if (code == 3) return "Nublado";
        if (code == 45 || code == 48) return "Neblina";
        if (code >= 51 && code <= 57) return "Llovizna";
        if (code >= 61 && code <= 67) return "Lluvia";
        if (code >= 71 && code <= 77) return "Nieve";
        if (code >= 80 && code <= 82) return "Chubascos";
        if (code >= 85 && code <= 86) return "Chubascos de nieve";
        if (code >= 95) return "Tormenta";
        return "Variable";
    }
}
