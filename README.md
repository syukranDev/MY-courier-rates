# New Update Goes Below
- **[RECOMENDDED]** Go to branch 'migrate-to-MongoDB' if you wish to avoid setup local mysql server and use monngodb for caching. You just need to run gateway and all microservices only. 

# MY-courier-rates
**Abstract**: <br>
 >Backend demonstatration on using gateway for multiple microservices in order to insulates the clients from how the application is partitioned into microservices. <br>
- Meaning to say, let User to connect one port only, gateway will do the port assigning part to user's desired microservices. <br> 

**Aim**: <br>
- Creating unified API (gateway + microservices) to get 3rd party courier parcel rates from one single API.

**Security/ Feature Implemented**:
- Middleware 1: Request body validaton (using Joi modules) 
- Middleware 2: Protected route (usage of JWT token) 
- Caching response to MySQL db if same request body.
- Logger via winston
- Microservices Management PM2 - load balancer, auto restart, logging viewing etc


**Tech stacks used**<br>
- NodeJS, ExpressJS, ES6 Javascript, MySQL, SwaggerUI & numbers of npm modules (see package.json)

<p align="center">
<img src="https://gcdnb.pbrd.co/images/jKqd8sA8V6VJ.jpg?o=1" width="75%">
</p> </br>                                                                       
                                                                        

## Pre-requisite
```
- npm 
- nodejs
- pm2 (same as docker but faster?)
- local mysql database
```

## One-Time Setup (NodeJS)
```
1. run: git clone <this-repo-url>
2. run: npm i 
3. For Gateway, Head to main directory and run pm2 ecosystem.config.js
2. For Microservices, Head to every /microservices/<services name>/ and run pm2 ecosystem.config.js (in this case microservices/auth and microservices/courier)

3 services need to up using pm2:
1. Gateway (ecosystem.config.js)
2. Auth Microservices (./microservices/auth/ecosystem.config.js)
3. Courier Microservices (./microservices/courier/ecosystem.config.js)

How to see logs in real time?
1. Run: pm2 log pm2_id_goes_here (get pm2 id by running 'pm2 ls a')<br>

How to see logs via files?
1. Logger saved seperately in microservices/..servicename../logs , logs will start generated once microservices is up.

``` 

<br>
<p align="center">
<img src="https://gcdnb.pbrd.co/images/l1oxUsuo5DbU.png?o=1" width="85%">
<p/><br>


## One-Time Setup (MySQL Database)
1. Edit your database credentials in microservices/..services../components/sql/index.js (OR create one with the exact credentials)
2. Add followings 2 tables
```
'CREATE TABLE `auth_token` (
  `username` varchar(255) DEFAULT NULL,
  `auth_token` varchar(255) DEFAULT NULL,
  `created_date` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'


'CREATE TABLE `getrates` (
  `domestic` varchar(2) DEFAULT NULL,
  `from_country` varchar(50) DEFAULT NULL,
  `from_state` varchar(50) DEFAULT NULL,
  `from_postcode` varchar(50) DEFAULT NULL,
  `to_country` varchar(50) DEFAULT NULL,
  `to_state` varchar(50) DEFAULT NULL,
  `to_postcode` varchar(50) DEFAULT NULL,
  `length` varchar(50) DEFAULT NULL,
  `width` varchar(50) DEFAULT NULL,
  `height` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `parcel_weight` varchar(50) DEFAULT NULL,
  `doc_weight` varchar(50) DEFAULT NULL,
  `rates` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci'



```
## SwaggerUI for your testing (or u may use curl/postman)
```
1. http://localhost:8900/portal/auth/api-docs/
2. http://localhost:8900/portal/courier/api-docs/
```

## How this works?

***Port assigning*** <br>
User will connect to gateay port only: <br>
Gateway using port 8900<br>
Auth Microservices using port 8901<br>
Courier Microservices using port 8902 <br>

***How to get into protected route*** <br>
1. Get token from /portal/auth/login <br>
you can put any username as you want, if the username is same as what presenteed in db, then the token will be updated. (or inserted if no match record founds.)<br>
If you dont put token or expired token, unathorized message will be return. Kindly note token generated will expired in 30mins. <br>
```
curl --location --request POST 'localhost:8900/portal/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username" : "syukranDev"
}'

//Expected response: 
{
    "username": "syukranDev",
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InN5dWtyYW5EZXYiLCJkYXRlIjoiMjAyMy0wMy0yN1QxMDo0MzozNS45MTFaIiwiaWF0IjoxNjc5OTEzODE1LCJleHAiOjE2Nzk5MTU2MTV9.uldJfEY3qc0LqSDnRtmyIIn6C56AL8vlhvsAsVpque0"
}
```
2. Put token into Bearer Token header inside /portal/courier/get-rates <br>
```
curl --location --request POST 'localhost:8900/portal/courier/get-rates' \
--header 'Authorization: Bearer <your-token-goes-here>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "domestic" : "Y",
    "from_country": "MY",
    "from_state": "Melaka",
    "from_postcode": "75000",
    "to_country": "MY",
    "to_state": "Selangor",
    "to_postcode": "42700",
    "length": "11",
    "width": "19",
    "height": "11",
    "type": "1",
    "parcel_weight": "3"
}'

//Expected response:
{
    "code": 200,
    "text": "success",
    "data": [
        {
            "courier": "Citilink",
            "rateInRinggit": 18
        },
        {
            "courier": "J&T",
            "rateInRiggit": 16.96
        }
    ]
}
```

Note: If request body is different that what was checked thorughout database, then it will fetch new data from all external 3rd party courier API and its response will be inserted into database for future querying (caching). (OR if request body is found to be same in database then output will be show database data) <br>

***Security Implemented*** <br>
1. Request body validation using Joi <br>
Any unwanted field in request payload or wrong datatype, will return error response on what field is missing/wrong. <br>

<p align="center">
<img src="https://gcdnb.pbrd.co/images/wKV8dRCxaTxW.png?o=1" width="75%">
<p/><br>

2. Usage of protected route<br>
Token inserted in protected route will be verified via portal/auth/verifyToken, else will return unathorized message <br>
<p align="center">
<img src="https://gcdnb.pbrd.co/images/qWUx2QVRAo0m.png?o=1" width="75%">
<p/><br>

<p align="center">
<img src="https://gcdnb.pbrd.co/images/6D0gkXaJYJK8.png?o=1" width="75%">
<p/><br>


## Known Bugs 
1. J&T rates API is using Cookies XSRF Token in its header request as part of their request validation. I am not sure how long the token will be lasts in my API. If my api is failing due to this, you can just manually get the XSRF token from their website and replace it in my codes. No permanent fix this since its being setup from their client side.
```
Copy below cookie and token values in sample cURL below, then replace in 'dataPromise2' and 'jntPromise' microservices/courier/components/sql/queries.js

curl 'https://www.jtexpress.my/shipping-rates' \
  -H 'authority: www.jtexpress.my' \
  -H 'accept: */*' \
  -H 'accept-language: en-US,en;q=0.9' \
  -H 'cache-control: no-cache' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'cookie: _ga=GA1.2.1799226497.1678279692; _gid=GA1.2.277345308.1679729433; XSRF-TOKEN=eyJpdiI6IjEyTmszR1htVkU3OUJXOHpiOU1Tdnc9PSIsInZhbHVlIjoiQTBMeVdCMnZIcEdHL0lBcGZqcktLTkQ0QTNCWVJpMVBOOFhmVy81US9yWG5BS2ZsU0xNUDJNUy82UmYwUEMzeVNqdTVrSVQxamdHWStMaGkxOEs5aXM0Slgra1pTY1NlZlJxdFhmMTBGclhveHhBajJ3c0JseGJETWxGOG1XMFMiLCJtYWMiOiIwNjQxMGQwMzJkOTM3MDI2NTFhZjIzNmVkYzIzMDg2NmNhZmIwMWY3OTljN2UzMTZiODk5MzYxZTllOTA3YTQwIn0%3D; jt_express_malaysia_session=eyJpdiI6IkI0dHJmZnl3VkhMczlXQ1dHYU91bFE9PSIsInZhbHVlIjoiK3ZUK1A0akZ0bGd0Q1g5S0E5ZEhDU1lhV0M3S093T2tqUDlhV2VYaE1pY2s0cjZ6VVBVOXVxdG5IK2U2K29uc3h3SWVXOHhDYWI3dU0wNDNaUEZ6bmR1eDB0MXgrWjFwOWZaL1oreWlaVUlodkhFenVmTUNNTG5vRExDbTZPVVIiLCJtYWMiOiI0ZTQ1ODBiMzMzMDRmNzc3NDg0ODY3ODcxZjg2YTM1YWRjOGNmYmI0NGY2ZTA0NDM2MWRiOGRmZDc5YTRjYjFmIn0%3D; _gat_gtag_UA_127851323_1=1' \
  -H 'origin: https://www.jtexpress.my' \
  -H 'pragma: no-cache' \
  -H 'referer: https://www.jtexpress.my/shipping-rates' \
  -H 'sec-ch-ua: "Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "Windows"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-origin' \
  -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36' \
  -H 'x-requested-with: XMLHttpRequest' \
  --data-raw '_token=tWhIqUXDwNfACqgzJwBdAVUmqIThHOw4myNYjKNU&shipping_rates_type=domestic&sender_postcode=42700&receiver_postcode=42700&destination_country=BWN&shipping_type=EZ&weight=10&length=10&width=10&height=10&item_value=' \
  --compressed
```
2. Not all external 3rd party courier API will use all the request body sent by UI, since all 3rd party APIs doesn't have the same request body field. For example, I am not sure what are the other alias use for country in Citilink API whilst J&T API doesn't use Country. You may use what stated in the Swagger example and change state and postcode and parcel dimensions + weight only for your testing, changing other field else might produce error. <br>

3. I dont do any valdation on postcode and its coressponding state. Using any postcode out of state range may produce error.  <br>

## Future Plans <br>
1. TDD unit test
2. environment config setup
3. More 3rd party courier api










