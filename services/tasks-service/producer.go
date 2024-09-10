package main

import (
	"fmt"
	"os"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

// This is an example of a producer that can be used to send messages to a Kafka topic.
// Please rework this code to fit your needs.

var producer *kafka.Producer

func initProducer() *kafka.Producer {
	if producer == nil {
		p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": os.Getenv("KAFKA_URI")})
		if err != nil {
			panic(err)
		}

		fmt.Printf("Created Producer %v\n", p)
		producer = p
	}

	return producer
}
