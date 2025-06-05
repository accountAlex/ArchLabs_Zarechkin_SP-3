## Вторая лаба

docker compose build user-service
docker compose up -d keydb user-service
docker compose logs -f user-service

POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Иван Иванов","email":"ivan@exaccmple.com"}'

curl -i http://localhost:3000/users/{id}

docker compose exec keydb keydb-cli
SET student:sp-3.13:18 "Zarechkin Alexander"
HMSET student:sp-3.13:18:info name "Zarechkin Alexander" age "21" email "m2203450@edu.misis.ru"
RPUSH student:sp-3.13:18:timetable "Архитектурирование" "Сертификация" "UI/UX"
SADD student:sp-3.13:18:skills "Docker" "NestJS" "PostgreSQL"
ZADD student:sp-3.13:18:tasks_w_priority 150 "Сделать лабу 2" 100 "Сделать лабу 1"


## Установить TTL:
EXPIRE student:sp-3.13:18 300
## Посмотреть TTL:
TTL student:sp-3.13:18
## Удалить ключ:
DEL student:sp-3.13:18



## Третья лаба
docker compose build notification-service
docker compose up -d rabbitmq notification-service
docker compose logs -f notification-service

# порт 3000!
curl -X POST http://localhost:3000/users \
     -H 'Content-Type: application/json' \
     -d '{"name":"Alexander","email":"alexander@example.com"}'

curl http://localhost:3000/users/{id}



# alert
curl -XPOST http://localhost:9093/api/v2/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
        "labels": {
          "alertname": "TestAlert",
          "severity": "info"
        },
        "annotations": {
          "summary": "Проверка Telegram уведомлений через Alertmanager"
        },
        "startsAt": "'"$(date -Iseconds)"'"
      }]'



curl -XPOST http://localhost:9093/api/v2/alerts \
  -H 'Content-Type: application/json' \
  -d '[{
        "labels": {
          "alertname": "ManualTest",
          "severity": "info",
          "job": "manual"
        },
        "annotations": {
          "summary": "Проверка Telegram уведомлений через Alertmanager"
        }
      }]'



for i in {1..50}; do
  curl -s -X POST http://localhost:3000/users \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"User${i}\",\"email\":\"user${i}@example.com\"}" > /dev/null &
done
wait


## Уникальные
ts=$(date +%s)
for i in {1..50}; do
  curl -s -X POST http://localhost:3000/users \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"User${i}\",\"email\":\"user${i}_${ts}@example.com\"}" > /dev/null &
done
wait




## rabit
4.1. 
Exchange: sp-3.13.fanout

Routing key: (оставь пустым)

Payload: {"type": "fanout test"}

После отправки открой очередь queue.sp-3.13 и нажми "Get Messages", чтобы убедиться, что сообщение пришло.

4.2. Проверка Direct Exchange
Exchange: sp-3.13.direct

Routing key: sp-3.13.routing.key

Payload: {"type": "direct test"}


Проверка Topic Exchange
Exchange: sp-3.13.topic

Routing key: sp-3.anything.routing.key

Payload: {"type": "topic test"}



4.4. Проверка Headers Exchange
Exchange: sp-3.13.headers

Routing key: (оставь пустым)

Payload: {"type": "headers test"}

Headers:

group: sp-3

number: 13


## Лаба 4

curl http://localhost:3000/metrics
