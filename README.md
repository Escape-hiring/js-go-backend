# Tasky

## Requirements

- Python 3.12 with `pip`, `setuptools`
- Node.js 20 with `npm`
- Docker 2.0 with `docker-compose`
- Golang 1.21

## Installation

```bash
make install
```

This command will:

- Install Node.js dependencies
- Install Golang dependencies

## Development

- The development environment is based on Docker containers. The `docker-compose.yml` file describes the services and their dependencies.
- The administration docker container is started with live-reload capabilities. Unless dependencies changed, there is no need to restart the container.
- The tasks docker container has to be rebuilt each time the code changes with `docker compose up --build tasks`

```bash
docker compose up
```

## Services

Tasky is made of 2 services:

- `administration`: A Node.js REST API, based on [express](https://expressjs.com) used to store users and tasks within a PostgreSQL database, and to manage authentication. It leverages the [Prisma](https://prisma.io) ORM. It can interact with Kafka through the [KafkaJs](https://kafka.js.org/docs/getting-started) library.
- `tasks` A Golang service composed of Kafka consumers and producers built on [confluent-kafka-go](https://github.com/confluentinc/confluent-kafka-go).

Both services can post and listen message from a [Redpanda](https://redpanda.com/) (~Kafka) message broker.

## Interfaces

- The `administration` service exposes a REST API on [localhost:2602](http://localhost:2602)
- The `tasks` listens on the Redpanda broker
- The Redpanda broker exposes a web interface on [localhost:15671](http://localhost:15671)
- The Postgres database can be accessed from [localhost:5432](localhost:5432)

## Usage and helpers

You can rely on the [Makefile](./Makefile) to run several lifecycle commands:

- migrate the database: `make migrate`
- reset the database: `make migrate-reset`
- check typing and the code quality: `make check`

You can also rely on bash scripts to interact with the services. Most of the time, these scripts do nothing more than a cURL.

- `./scripts/create-user.sh` to create a user
- `./scripts/get-me.sh` to fetch the authenticated user

## How tos

### How to add or update a model in the database

- The database is managed through [Prisma](https://prisma.io), a Node.js ORM. To add or update a model, you need to edit the `services/administration/prisma/schema.prisma` file, then run a database migration:

```bash
make migrate
```

- Database credentials and parameters are defined in the docker-compose.yml file for docker environements and in the [.env](./services/administration-service/.env) file for local development.

### How to send a message to the message broker

#### Node.js example

- See `createUser` in [services/administration-service/src/lib/users.ts](./services/administration-service/src/lib/users.ts)
- Browse the redpanda console on [localhost:15671](localhost:15671) -> `Topics` -> `<topic name>`

#### Golang example

You can import the producer from `producer.go` service, then call `sendJson` on it to publish a message to the given topic.

- Browse the redpanda console on [localhost:15671](localhost:15671) -> `Topics` -> `<topic name>`

### How to consume a message from the message broker

#### Node.js example

- This one is up to you ;)

#### Golang example

You can import the function `Consume` from `consumer.go`, then call it to consume messages from the given topic. An example can be found in [services/tasks-services/tasks/main.go](./services/tasks-service/tasks/main.go)
