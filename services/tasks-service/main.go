package main

import (
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

func main() {
	// producer := NewAMQPClient()
	// producer.Send(TaskCreatedTopic, []byte("Hello, World!"))

	NewAMQPClient().Consume(
		UserCreatedTopic,
		onUserCreated,
	)

	// Wait forever to not close the program
	forever := make(chan bool)
	fmt.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}
