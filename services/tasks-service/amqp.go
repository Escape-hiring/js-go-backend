package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

const UserCreatedTopic = "user.created"
const TaskCreatedTopic = "task.created"

type AMQPClient struct {
	conn *amqp091.Connection
	ch   *amqp091.Channel
}

func NewAMQPClient() *AMQPClient {
	amqpURL := os.Getenv("RABBITMQ_URL")
	if amqpURL == "" {
		amqpURL = "amqp://guest:guest@localhost:5672/"
	}
	log.Printf("Connecting to RabbitMQ at %s", amqpURL)

	conn, err := amqp091.Dial(amqpURL)
	failOnError(err, "Failed to connect to RabbitMQ")
	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")

	return &AMQPClient{
		conn: conn,
		ch:   ch,
	}
}

func (c *AMQPClient) assertQueue(name string) {
	_, err := c.ch.QueueDeclare(
		name,  // name
		false, // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	failOnError(err, "Failed to declare a queue")
}

func (c *AMQPClient) Close() {
	c.ch.Close()
	c.conn.Close()
}

func (c *AMQPClient) Send(topic string, body []byte) {
	c.assertQueue(topic)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := c.ch.PublishWithContext(ctx,
		"",     // exchange
		topic, // routing key
		false,  // mandatory
		false,  // immediate
		amqp091.Publishing{
			ContentType: "text/plain",
			Body:        body,
		})
	failOnError(err, "Failed to publish a message")

	log.Printf(" [x] Sent %d bytes on topic %s", len(body), topic)
}

func (c *AMQPClient) Consume(topic string, handler func(msg *amqp091.Delivery) error) {
	c.assertQueue(topic)

	msgs, err := c.ch.Consume(
		topic, // queue
		"",    // consumer
		true,  // auto-ack
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	failOnError(err, "Failed to register a consumer")
	forever := make(chan bool)

	go func() {
		for d := range msgs {
			log.Printf("Received %d bytes on topic %s", len(d.Body), topic)
			err := handler(&d)
			if err != nil {
				log.Printf("Error handling message: %v", err)
			}
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
