# mafia-ops

Общий Docker Compose для разработки InnoMafia и проверка совместимости
`mafia-api`, `mafia-web` и PostgreSQL. Веб и API доступны через один
Caddy. PostgreSQL хранит данные в именованном томе.

## Локальный запуск

Требуются Docker с Compose v2, Make и curl. Положите `mafia-api`,
`mafia-web` и `mafia-ops` рядом или задайте `API_DIR` и `WEB_DIR` с путями
к исходникам. На этапе стартовых PR исходники должны соответствовать
ревизиям из [sources.json](sources.json).

```bash
make dev
# http://127.0.0.1:8787
make smoke
make down
```

`MAFIA_PORT` позволяет выбрать другой порт. Compose публикует только веб на
loopback. Учётные данные в Compose предназначены для локальной разработки.
`make down` останавливает сервисы и сохраняет том PostgreSQL.

Если сборщик работает за прокси с корпоративным CA, Dockerfile приложений
принимают полный доверенный PEM-бандл через build secret `build_ca`.
Передайте его через локальный Compose override в `build.secrets` для
`api` и `web`. Ключи и сертификаты среды держите вне репозитория.

## Проверка из браузера

Требуются Node.js из `.node-version` и pnpm 11.25.0. На Linux установите
Chromium и зависимости из Playwright.

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
make e2e
```

Тесты проверяют десктопное открытие сайта, проход до Go API через Caddy,
маршрутизацию и повтор запроса после ошибки. CI фиксирует исходники по SHA,
сравнивает спецификации OpenAPI, собирает оба образа, проверяет readiness
при остановке и повторном запуске PostgreSQL и сохраняет трассировку
браузера при падении. В production предполагается продвигать уже
проверенные образы по digest, детали — в [модели релиза](docs/releases.md).
