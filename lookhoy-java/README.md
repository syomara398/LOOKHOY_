# LookHoy

Recomendador de outfits según **clima** y **ocasión** (feria, instituto, cita…).
Curso Integrador I — Sistemas / Software, UTP Ica (2026). Avance de Proyecto Final 3.

Aplicación de escritorio en **Java 17 + Swing**, con arquitectura **MVC + DAO**, principios **SOLID**, pruebas **JUnit 5 (TDD)** y las librerías **Guava, Apache Commons, Apache POI y Logback**.

## Ejecutar

Requisitos: JDK 17+ y Maven 3.9+.

```bash
mvn test            # corre las pruebas unitarias y de integración
mvn compile exec:java   # abre la aplicación (crea lookhoy.db en la carpeta actual)
mvn javadoc:javadoc     # genera la documentación en target/site/apidocs
```

## Funcionalidades de este avance
- Registro e inicio de sesión (contraseña con PBKDF2 + sal, validación de entradas).
- Clóset: agregar prendas (categoría, estilo, nivel de abrigo), favoritos, eliminar.
- Clima real por ciudad (Open-Meteo, sin API key).
- Outfit del día según ocasión y sensación térmica; botón "Otra sugerencia".
- Exportar el clóset a Excel (.xlsx).

Pendiente para siguientes avances: fotos de prendas, historial de outfits, ocasiones personalizadas.
El diseño UX/UI original está en `prototipo-web/` (React + Vite, exportado de Figma Make).

## Estructura
```
src/main/java/pe/utp/lookhoy
├── model/       Entidades inmutables (Garment, User, Suggestion, WeatherInfo…)
├── dao/         Interfaces DAO + implementaciones SQLite (JDBC) y en memoria (pruebas)
├── service/     Lógica de negocio (Auth, Closet, OutfitRecommender, clima, Excel)
├── controller/  Controladores que conectan vista y servicios
├── view/        Interfaz Swing (Login, Clóset, Outfit, MainFrame)
├── security/    PasswordHasher, InputValidator
├── util/        DatabaseConfig
└── App.java     Raíz de composición (inyección manual de dependencias)
src/test/java/…  Pruebas JUnit 5
docs/            Arquitectura, guion de sustentación, guía de Git, rúbrica
```
Detalle en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).
