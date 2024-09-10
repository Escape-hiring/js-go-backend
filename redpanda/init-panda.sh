#!/bin/bash

if [ -z "$ENVIRONMENT" ]; then
    exit 1
fi
if [ -z "$REDPANDA_URI" ]; then
    exit 1
fi
if [[ "$ENVIRONMENT" == "development" ]]; then
    REP="1"
else
    REP="3"
fi

function assert_topic() { 
    topic="$1"
    shift
    partition="$1"
    shift
    create_args=""
    config_args=""
    while [[ $# -gt 0 ]]; do
        create_args="$create_args -c $1"
        config_args="$config_args -s $1"
        shift
    done
    rpk topic create "${topic}" \
        --brokers "${REDPANDA_URI}" \
        --partitions "${partition}" \
        --replicas "${REP}" \
        $create_args
    rpk topic alter-config "${topic}" \
        --brokers "${REDPANDA_URI}" \
        $config_args
}

while ! rpk topic list --brokers ${REDPANDA_URI}; do
    sleep 1;
    echo "Waiting for kafka";
done

assert_topic "users.created" "3" \
    "segment.bytes=268435456" \
    "retention.ms=21600000" \
    "retention.bytes=536870912" \
    "max.message.bytes=10485760"

assert_topic "task.created" "3" \
    "segment.bytes=268435456" \
    "retention.ms=21600000" \
    "retention.bytes=536870912" \
    "max.message.bytes=10485760"

assert_topic "task.updated" "3" \
    "segment.bytes=268435456" \
    "retention.ms=21600000" \
    "retention.bytes=536870912" \
    "max.message.bytes=10485760"

exit 0
