# COLORS
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)
SHELL := /bin/bash

.PHONY: install
install:
	@echo "${GREEN}Installing dependencies... ${RESET}"
	cd ./services/administration-service && npm install
	cd ./services/tasks-service && go mod download

migrate-dry:
	@echo "${GREEN}Running migrations... ${RESET}"
	cd ./services/administration-service && npm run migrate:dry

migrate-reset:
	@echo "${YELLOW}Resetting database... ${YELLOW}"
	cd ./services/administration-service && npm run migrate reset

migrate:
	@echo "${GREEN}Running migrations... ${RESET}"
	cd ./services/administration-service && npm run migrate

up:
	@echo "${GREEN}Starting services... ${RESET}"
	docker-compose up -d

start: install up migrate

check:
	@echo "${GREEN}Checking source code... ${RESET}"
	cd ./services/administration-service && npm run check:type
	cd ./services/tasks-service && go build -o /dev/null
	cd ./services/tasks-service && golangci-lint run --fast -- $(go list -f '{{.Dir}}/...' -m)