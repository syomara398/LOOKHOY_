package pe.utp.lookhoy.service;

import pe.utp.lookhoy.model.WeatherInfo;

/** Abstracción del proveedor de clima (DIP/OCP): se puede cambiar o simular en pruebas. */
public interface WeatherProvider {
    /** @throws WeatherException si la ciudad no existe o el servicio falla */
    WeatherInfo fetch(String city) throws WeatherException;
}
