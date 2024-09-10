# /bin/bash

echo "Usage: ./scripts/create-user.sh <email> <password>"
echo "Creating user $1 with password $2"

curl -X POST -H 'Accept: application/json' -H 'Content-Type:application/json' -d "{\"email\": \"$1\", \"password\": \"$2\"}" localhost:2602/users