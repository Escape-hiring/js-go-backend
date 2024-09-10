# /bin/bash

echo "Usage: ./scripts/get-me.sh <email> <password>"
echo "Getting user from JWT $1"

curl -X GET -H 'Accept: application/json' -H 'Content-Type:application/json' -H "Authorization: Bearer $1" localhost:2602/users/me