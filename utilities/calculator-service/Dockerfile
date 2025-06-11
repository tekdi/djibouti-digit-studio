# Stage 1: Build the Go binary
FROM golang:1.24-alpine AS build

ARG WORK_DIR
WORKDIR /app

# Install git (sometimes required by Go modules)
RUN apk add --no-cache git

# Copy go.mod and go.sum, then download dependencies
COPY ${WORK_DIR}/go.mod ${WORK_DIR}/go.sum ./
RUN go mod download

# Copy source code
COPY ${WORK_DIR}/ ./

# Build the Go binary
RUN go build -o service-binary

# Stage 2: Create a minimal runtime image
FROM alpine:3.18

WORKDIR /opt/egov

# Copy the compiled binary and .env file
COPY --from=build /app/service-binary .
COPY start.sh .

# Ensure binary is executable
RUN chmod +x ./start.sh

CMD ["./start.sh"]
