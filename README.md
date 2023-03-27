# MY-courier-rates
**Abstract**: <br>
 >Backend demonstatration on using gateway for multiple microservices in order to insulates the clients from how the application is partitioned into microservices. <br>
- Meaning to say, let User to connect one port only, gateway will do the port assigning part to user's desired microservices. <br> 

**Aim**: <br>
- Creating unified API (gateway + microservices) to get 3rd party courier parcel rates from one single API.

**Security/ Feature Implemented**:
- Middleware 1: Request body validaton (using Joi modules) 
- Middleware 2: Protected route (usage of JWT token) 
- Logger via winston

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
1. Edit your database credentials in microservices/..services../components/sql/index.js (create one with the exact credentials)
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
If you dont put token or expired token, unathorized message will be return. Kindly note token generated will expired in 30mins
2. Put token into Bearer Token header inside /portal/courier/get-rates <br>

Note: If request body is different that what was checked thorughout database then it will fetch new data from external 3rd party courier API and inserted into databse for future querying (caching). (OR if request body is found to be same in database then output will be show database data) <br>

***Security Implemented*** <br>
1. Request body validation using Joi <br>
Any unwanted field in request payload or wrong datatype, will return error response on what field is missing/wrong <br>

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
2. Not all external 3rd party courier api will use the request body sent by UI, since all 3rd party APIs doesnt have the same request body field. For example, I am not sure what are the alias use for country etc used in all 3rd party courier API used. You may use what stated in the swagger example and change state and postcode and parcel dimensions + weight only for your testing, else might produce error.

## Future Plans <br>
1. TDD unit test
2. environment config setup
3. More 3rd party courier api










