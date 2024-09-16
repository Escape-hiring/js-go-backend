package main

import (
	"fmt"

	"github.com/rabbitmq/amqp091-go"
)

func onUserCreated(msg *amqp091.Delivery) error {
	fmt.Println("User created:")
	fmt.Println(string(msg.Body))
	return nil
}
