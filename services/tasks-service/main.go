package main

import (
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

func handler(msg *amqp091.Delivery) error {
	fmt.Println(string(msg.Body))
	return nil
}

func main() {
	client := NewAMQPClient()


	client.Consume(
		UserCreatedTopic,
		handler,
	)

	// client.Send(TaskCreatedTopic, []byte("Hello, World!"))
}
