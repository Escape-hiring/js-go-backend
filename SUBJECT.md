# Escape's JS/Golang backend challenge - 3 hours

## Introduction

### Context

You are working on the company's internal task management tool. The architecture of the system is described in the [README.md](./README.md) file. You have been tasked with providing a first POC of this system.

The first version of the system should allow users to create tasks, and have them handled by a worker. The worker should update the task status to `RUNNING`, then `SUCCESS` or `FAILED` (randomly) after some delay. This information should be accessible to the user from a REST API.

### Instructions

### Guidelines

- Your git history matters, it will be used to perform the review. **Please make a commit per exercice**
- You can use any library you want, but you should be able to explain why you chose it
- The best way for you to present your work is to provide a link to a git repository.
- You have to send us something after 3 hours, even if you haven't finished. All that being said, if you want to, you can use more than 3 hours to finish the challenge and showcase your skills.

### Don't forget

- Read the README.md file
- Any best practice regarding event based system, or Node.js, or Golang, or anything else, that you would like to showcase, is welcome
- To restart your docker containers in case of trouble

### Known issues

- After running a migration, you might need to rebuild the `administration` service to have it work correctly. This is due to the way the `prisma` client is generated.

```bash
make migrate
docker-compose up --build administration
```

## Exercice 1: Have the administation service handling tasks

Currently, the administration service is only handling users, and their authorization. We want to extend it to handle tasks. This involves:

- Storing tasks in the database
- Exposing a POST route to create a task attached to the authenticated user
- Expose a GET route to list the tasks of the authenticated user and their status
- Publish a message on the broker when a task is created to have it scheduled by another service

Relevant documentation:

- <https://www.prisma.io/docs/orm/prisma-schema/data-model/models>
- <https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations>
- <https://expressjs.com/fr/guide/routing.html>
- <https://expressjs.com/fr/guide/using-middleware.html>
- <https://www.rabbitmq.com/tutorials>

### 1.1 - Create a task model

Update the Prisma schema so that it features a `Task` model. A task can have the fields you want, but it **must** feature the following fields at least:

- `id`: A unique identifier
- `status`: The status of the task. It can be `PENDING`, `RUNNING`, `SUCCESS` or `FAILED`

Also, it **must** be in a many (tasks) to one (user) relationship with the `User` model.

### 1.2 - Create a task

Add a POST route to the `administration` service to create a task. It should be accessible at `/tasks`.

### 1.3 - List the tasks of the authenticated user

Add a GET route to the `administration` service to list the tasks of the authenticated user. It should be accessible at `/tasks`.

### 1.4 - Publish a message on the broker when a task is created

When a task is created, publish a message on the `task.created` topic. The message should contain the task's `id` and the `userId` of the authenticated user.

## Exercice 2: Have the tasks service handling tasks

Currently, the tasks service is not doing much. It listens on the `user.created` topic and logs the message. We want to extend it to handle tasks. This involves:

- Listening on the `task.created` topic and start a fake async worker that will update the task status to `RUNNING`, then `SUCCESS` or `FAILED` (randomly) after some delay
- Publish a message on the broker when a task's status changes to `RUNNING`, `SUCCESS` or `FAILED`
- Have the administration service listen on the `task.updated` topic and update the task status in the database

Relevant documentation:

- <https://www.rabbitmq.com/tutorials/tutorial-one-go#sending>
- <https://www.rabbitmq.com/tutorials/tutorial-one-go#receiving>

### 2.1 - Listen on the `task.created` topic

- Update the `tasks` service so that it listens on the `task.created` topic.
- When a message is received, start a fake async worker that will update the task status to `RUNNING`, then `SUCCESS` or `FAILED` (randomly) after some delay.
- After the delay is up, the task should become `SUCCESS` or `FAILED` randomly.

### 2.2 - Publish a message on the broker when a task's status changes

- When a task's status changes to `RUNNING`, `SUCCESS` or `FAILED`, publish a message on the `task.updated` topic.
- Have the administration service listen on the `task.updated` topic and update the task status in the database.
- You should uppdate the `amqp.ts` file to define a RabbitMQ consumer.

## 2.3: Make sure many tasks can be handled simultaneously

- Your handler should be able to handle many tasks simultaneously. Make sure it does not block the event loop.

## Exercice 3: Improve the system if you have time

The following challenges are probably larger than what can be done in 3 hours, but if you have time, you can try to tackle them. You can also provide us with the design of the system that we will discuss during the review.

Suggestions:

- Retry tasks that failed and send the ones that failed too many times to a dead letter queue
- Have the tasks emitting fake logs
- Discuss the scaling capabilities of the system
