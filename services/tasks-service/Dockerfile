# first stage
FROM golang:1.21.1 as build_base
WORKDIR /src
COPY go.mod .
COPY go.sum .
RUN go mod download

# second stage
FROM build_base AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -tags netgo -o /bin/app

# final stage
FROM debian:stable-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates
COPY --from=builder /bin/app /bin/app
EXPOSE 80
ENTRYPOINT ["/bin/app"]