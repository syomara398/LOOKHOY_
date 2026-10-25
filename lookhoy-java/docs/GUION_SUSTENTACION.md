# Guion de sustentación (≈10 min, todos los integrantes participan)

| Min | Sección | Qué decir / mostrar |
|---|---|---|
| 0:00–1:00 | Contexto | Problema: no saber qué ponerse según el clima y la ocasión. Solución: LookHoy. |
| 1:00–2:00 | Alcance | Funcionalidades de este avance vs. Matriz de Requerimientos (porcentaje real). |
| 2:00–4:00 | Arquitectura | Diagrama MVC + DAO (`docs/ARQUITECTURA.md`). Explicar que la vista nunca toca el DAO. |
| 4:00–5:30 | SOLID y TDD | Mostrar `OutfitRecommender` + su prueba; DAO en memoria vs SQLite (Liskov/DIP). Ejecutar `mvn test`. |
| 5:30–6:30 | Librerías | Guava, Commons, POI (exportar Excel en vivo), Logback (mostrar `logs/lookhoy.log`). |
| 6:30–7:30 | Seguridad | Hash con sal, PreparedStatement, validaciones, mensaje genérico de login. |
| 7:30–8:30 | Demo UI | Registro → agregar prendas → clima de Ica → outfit → "Otra sugerencia". |
| 8:30–9:30 | Git/GitHub | Historial de commits, ramas, PR, tag. |
| 9:30–10:00 | Cierre | Pendientes y siguiente avance. |

Cada integrante debe dominar la sección que presenta y poder explicar el código (criterio de **autoría**).
