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

- `administration`: A Node.js REST API, based on [express](https://expressjs.com) used to store users and tasks within a PostgreSQL database, and to manage authentication. It leverages the [Prisma](https://prisma.io) ORM. It can interact with RabbitMQ through the [amqplib](https://github.com/amqp-node/amqplib) library.
- `tasks` A Golang service composed of RabbitMQ consumers and producers

Both services can post and listen message from a [RabbitMQ](https://www.rabbitmq.com) broker.

## Interfaces

- The `administration` service exposes a REST API on [localhost:2602](http://localhost:2602)
- The `tasks` listens on the RabbitMQ broker
- The RabbitMQ broker exposes a web interface on [localhost:15671](http://localhost:15671)
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
- Browse the RabbitMQ console on [http://localhost:15672/#/queues/%2F/user.created](http://localhost:15672/#/queues/%2F/user.created)

#### Golang example

- See `client.Send(...)` in [services/tasks-service/tasks/main.go](./services/tasks-service/tasks/main.go)

- Browse the RabbitMQ console on [http://localhost:15672/#/queues/%2F/user.created](http://localhost:15672/#/queues/%2F/user.created)

### How to consume a message from the message broker

#### Node.js example

- This one is up to you ;)

#### Golang example

- See `client.Consume(...)` in [services/tasks-service/tasks/main.go](./services/tasks-service/tasks/main.go)
