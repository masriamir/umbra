SHELL         := /bin/bash
.DEFAULT_GOAL := help

PYTHON  := uv run python
PYTEST  := uv run pytest
RUFF    := uv run ruff
MYPY    := uv run mypy

# ── Help ───────────────────────────────────────────────────────────────────────

.PHONY: help
help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ── Dependencies ───────────────────────────────────────────────────────────────

.PHONY: install
install: install-backend install-frontend ## Install all dependencies (backend + frontend)

.PHONY: install-backend
install-backend: ## Sync Python dependencies via uv
	uv sync

.PHONY: install-frontend
install-frontend: ## Install npm packages in frontend/
	cd frontend && npm install

# ── Development servers ────────────────────────────────────────────────────────

.PHONY: dev
dev: ## Run the API and frontend servers concurrently (Ctrl+C stops both)
	@echo "Starting servers — Ctrl+C to stop."
	@trap 'kill 0' SIGINT; \
	$(PYTHON) manage.py runserver & \
	cd frontend && npm run dev & \
	wait

.PHONY: api
api: ## Run the Django API server
	$(PYTHON) manage.py runserver

.PHONY: frontend
frontend: ## Run the Vite frontend dev server
	cd frontend && npm run dev

# ── Django management ──────────────────────────────────────────────────────────

.PHONY: migrate
migrate: ## Apply pending database migrations
	$(PYTHON) manage.py migrate

.PHONY: migrations
migrations: ## Generate migrations for model changes
	$(PYTHON) manage.py makemigrations

.PHONY: shell
shell: ## Open the Django shell
	$(PYTHON) manage.py shell

.PHONY: superuser
superuser: ## Create a Django superuser
	$(PYTHON) manage.py createsuperuser

# ── Testing ────────────────────────────────────────────────────────────────────

.PHONY: test
test: ## Run all tests
	$(PYTEST)

.PHONY: test-unit
test-unit: ## Run unit tests only
	$(PYTEST) -m unit

.PHONY: test-integration
test-integration: ## Run integration tests only
	$(PYTEST) -m integration

.PHONY: test-cov
test-cov: ## Run tests and print a coverage report
	$(PYTEST) --cov --cov-report=term-missing

.PHONY: test-watch
test-watch: ## Re-run tests automatically on file changes
	uv run ptw

# ── Code quality ───────────────────────────────────────────────────────────────

.PHONY: lint
lint: ## Lint Python code with ruff (report only)
	$(RUFF) check .

.PHONY: lint-fix
lint-fix: ## Lint Python code with ruff and auto-fix safe issues
	$(RUFF) check --fix .

.PHONY: format
format: ## Format Python code with ruff
	$(RUFF) format .

.PHONY: format-check
format-check: ## Check Python formatting without modifying files
	$(RUFF) format --check .

.PHONY: typecheck
typecheck: ## Run mypy static type checker
	$(MYPY) .

.PHONY: check
check: lint format-check typecheck ## Run all quality checks (no files modified)

.PHONY: fix
fix: lint-fix format ## Auto-fix lint issues and reformat code

# ── Versioning ─────────────────────────────────────────────────────────────────

.PHONY: version-major
version-major: ## Tag a new major version (vX.0.0) — resets minor and revision
	@CURRENT=$$(git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || echo "0.0.0"); \
	MAJOR=$$(echo "$$CURRENT" | cut -d. -f1); \
	NEW=$$((MAJOR+1)).0.0; \
	git tag -a "v$$NEW" -m "Version $$NEW"; \
	echo "Tagged v$$NEW"

.PHONY: version-minor
version-minor: ## Tag a new minor version (vx.Y.0) — resets revision
	@CURRENT=$$(git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || echo "0.0.0"); \
	MAJOR=$$(echo "$$CURRENT" | cut -d. -f1); \
	MINOR=$$(echo "$$CURRENT" | cut -d. -f2); \
	NEW=$$MAJOR.$$((MINOR+1)).0; \
	git tag -a "v$$NEW" -m "Version $$NEW"; \
	echo "Tagged v$$NEW"

.PHONY: version-revision
version-revision: ## Tag a new revision (vx.y.Z)
	@CURRENT=$$(git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || echo "0.0.0"); \
	MAJOR=$$(echo "$$CURRENT" | cut -d. -f1); \
	MINOR=$$(echo "$$CURRENT" | cut -d. -f2); \
	REVISION=$$(echo "$$CURRENT" | cut -d. -f3); \
	NEW=$$MAJOR.$$MINOR.$$((REVISION+1)); \
	git tag -a "v$$NEW" -m "Version $$NEW"; \
	echo "Tagged v$$NEW"

# ── Build ──────────────────────────────────────────────────────────────────────

.PHONY: build
build: ## Build the frontend for production
	cd frontend && npm run build

# ── Clean ──────────────────────────────────────────────────────────────────────

.PHONY: clean
clean: ## Remove build artifacts and caches
	rm -rf frontend/dist .mypy_cache .ruff_cache .pytest_cache .coverage
	@find . -not -path "./.venv/*" -type d -name "__pycache__" \
		-exec rm -rf {} + 2>/dev/null || true

.PHONY: clean-all
clean-all: clean ## Remove all generated files including installed dependencies
	rm -rf .venv frontend/node_modules
