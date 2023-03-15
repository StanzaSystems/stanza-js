## Search

Search feature available
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "search",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 1,
    "enabledPercent": 100,
    "messageEnabled": "We are having trouble with search section - please retry your request.",
    "messageDisabled": "Search is unavailable right now"
}'
```

Search feature partially available
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "search",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 1,
    "enabledPercent": 80,
    "messageEnabled": "We are having trouble with search section - please retry your request.",
    "messageDisabled": "Search is unavailable right now"
}'
```

Search feature unavailable
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "search",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 1,
    "enabledPercent": 0,
    "messageEnabled": "We are having trouble with search section - please retry your request.",
    "messageDisabled": "Search is unavailable right now"
}'
```

## Featured

Featured feature available
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "featured",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 2,
    "enabledPercent": 100,
    "messageEnabled": "We are having trouble with featured section - please retry your request.",
    "messageDisabled": "Featured is unavailable right now"
}'
```

Featured feature partially available
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "featured",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 2,
    "enabledPercent": 80,
    "messageEnabled": "We are having trouble with featured section - please retry your request.",
    "messageDisabled": "Featured is unavailable right now"
}'
```

Featured feature unavailable
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "featured",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 2,
    "enabledPercent": 0,
    "messageEnabled": "We are having trouble with featured section - please retry your request.",
    "messageDisabled": "Featured is unavailable right now"
}'
```

## Checkout

Checkout feature available
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "checkout",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 1,
    "enabledPercent": 100,
    "messageEnabled": "We are having trouble with checkout section - please retry your request.",
    "messageDisabled": "Checkout is unavailable right now"
}'
```

Checkout feature partially available
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "checkout",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 1,
    "enabledPercent": 80,
    "messageEnabled": "We are having trouble with checkout section - please retry your request.",
    "messageDisabled": "Checkout is unavailable right now"
}'
```

Checkout feature unavailable
```shell
curl --location 'localhost:3001/feature' \
--header 'Content-Type: application/json' \
--data '{
    "featureName": "checkout",
    "actionCodeEnabled": 0,
    "actionCodeDisabled": 1,
    "enabledPercent": 0,
    "messageEnabled": "We are having trouble with checkout section - please retry your request.",
    "messageDisabled": "Checkout is unavailable right now"
}'
```
