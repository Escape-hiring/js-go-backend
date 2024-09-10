package main

import (
	"fmt"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func handler(msg *kafka.Message) {
	fmt.Printf("Handler: Message on %s: %s\n", msg.TopicPartition, string(msg.Value))
}

func main() {
	Consume([]string{"users.created"}, handler)
}
