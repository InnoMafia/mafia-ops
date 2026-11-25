MAFIA_PORT ?= 8787
MAFIA_BASE_URL ?= http://127.0.0.1:$(MAFIA_PORT)

.PHONY: check dev down smoke e2e

check:
	docker compose config --quiet

dev: check
	docker compose up -d --build --wait --wait-timeout 90
	$(MAKE) smoke

down:
	docker compose down

smoke:
	curl --noproxy '*' --fail --silent --show-error --retry 12 --retry-all-errors --retry-delay 1 --max-time 3 "$(MAFIA_BASE_URL)/readyz"
	curl --noproxy '*' --fail --silent --show-error "$(MAFIA_BASE_URL)/api/v1/status"

e2e:
	MAFIA_BASE_URL="$(MAFIA_BASE_URL)" pnpm exec playwright test
