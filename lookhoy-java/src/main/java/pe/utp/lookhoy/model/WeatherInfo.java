package pe.utp.lookhoy.model;

/** Clima actual de una ciudad. */
public record WeatherInfo(String city, String country, int tempC, int feelsC,
                          int humidity, int windKmh, int code, String description,
                          int rainProb, boolean rainy) { }
