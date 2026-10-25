# Control de versiones (Git + GitHub)

La consigna pide evidencia de **todos** los avances en GitHub: haz commits pequeños y frecuentes con tu propio usuario.

```bash
git init -b main
git remote add origin https://github.com/<usuario>/lookhoy.git
git add . && git commit -m "chore: estructura inicial Maven y logback"
git push -u origin main
```

## Flujo sugerido
- Rama `main` estable; ramas `feature/<tema>` para cada avance (`feature/auth`, `feature/closet-dao`, `feature/outfit-recommender`, `feature/weather`, `feature/excel-export`).
- Mensajes tipo Conventional Commits: `feat:`, `test:`, `fix:`, `docs:`, `chore:`.
- TDD en el historial: un commit `test:` (prueba que falla) seguido de uno `feat:` (la hace pasar).
- Pull Request por rama, revisado por el responsable de control de versiones (la consigna recomienda designar uno).
- Etiqueta al entregar: `git tag v0.3.0-avance3`.
- Usa Issues/Projects de GitHub como tablero ágil (To do / Doing / Done).
