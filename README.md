# Email Notification Service

## Asynchronous Hook API for Email Notifications

This microservice provides an asynchronous Hook API for triggering Email Notifications. The service allows you to send email notifications by accepting a payload via the API endpoint, storing the request in a database, and sending the email through an email delivery service. The service is designed to respond immediately upon receiving the request, without waiting for the data to be saved in the database or for the external call to the Email Delivery Service to finish.

## Features

- Accepts a payload via the Hook API endpoint
- Stores the email notification request in a database for future reference.
- Sends the email through an external Email Delivery Service.
- Responds with a success status code without a response body content.
- Ensures resiliency by handling database storage and external API calls for email delivery.

## Endpoints

- `/api/hook` - **POST** - This is the main endpoint to be called. It accepts `payload` such as email related payload. For example:

```json
{
  "payload": {
    "to": <recipient email address>,
    "subject": <any subject>,
    "message": <any message>
    }
}
```

### Response:

```
- Success: 200 OK (No response body content)
- Error: 400 Bad Request (If the request is invalid, missing payload or email not in correct format)
- Error: 500 Internal Server Error (Something went really wrong, you should start debugging)
```

---

- `/api/email/send` - **POST** - Another post endpoint that responsible for sending email out using your preferred Email Provider (in this codebase I am using Gmail API). This endpoint will also be explicitly invoked by the previous `/api/hook` endpoint upon any successful email payload being called.

### Response:

```
- Success: 200 OK (No response body content)
- Error: 400 Bad Request (If the request is invalid, missing payload or email not in correct format)
- Error: 500 Internal Server Error (Something went really wrong, you should start debugging)
```

---

- `/api/email/list` - **GET** - The only endpoint that Frontend application will be calling to fetch all data from databases

### Response:

```
- Success: 200 OK (Will return you the list of messages response payload)
- Error: 500 Internal Server Error (Error while fetching list of message response payload probably due to inability to access MongoDB, check credentials and network access from mongoDB cloud)
```

---

- `/api/healthcheck` - **GET** - Just a plain healthcheck API to check if the service is up / down

### Response:

```
- Success: 200 OK (Will return you string of plain text if accessible = Beep bop, I am healthy and alive)
```

---

## Technologies Used

- Node.js
- Express.js
- Socket.io
- Typescript
- MongoDB (or any preferred database)
- Gmail API
- OAuth2
- Axios
- Jest
- ESBuild

## Pre-Requisites

To run this application ensure the following are installed:

- Node.js (I am using v20.4.0 as this readme is written)
- MongoDB (I am using the cloud version)
- Gmail OAuth setup (If you are using Gmail API provider). Check out their API documentation [here](https://developers.google.com/identity/protocols/oauth2)

Copy over `.env.example` in the root directory and rename to `.env`

```bash
PORT=4000
MONGODB_USERNAME=<Use your own MongoDB Cloud Credentials>
MONGODB_PASSWORD=<Use your own MongoDB Cloud Credentials>
MONGODB_DBNAME=<Use your own MongoDB Cloud Credentials>
GMAIL_CLIENTID=<Get it from Google Cloud Console (GCP)>
GMAIL_CLIENTSECRET=<Get it from Google Cloud Console (GCP)>
GATEWAY_URI=http://localhost:4000 # if you change it here, remember to change the frontend connectivity as well
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/calvadoz/email-notification-service.git
```

2. Navigate to the project directory

```bash
cd email-notification-service
```

3. Install dependencies (recommended to use [pnpm](https://pnpm.io/))

```bash
pnpm install
or
yarn install
or
npm install
```

4. Configure the `.env` as explained before
5. Build the application (optional)

```bash
pnpm build
```

6. Start the application

```bash
pnpm start:dev
or
pnpm start
```

If application is started correctly you will see this message

```bash
❯ pnpm start:dev

> email-notification-service@1.0.0 start:dev /Users/calvadoz/Workspaces/technical-task/email-notification-service
> nodemon src/index.ts

[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: ts,json
[nodemon] starting `ts-node src/index.ts`
Connected to MongoDB
Server is running on port 4000
```

If the [frontend application](https://github.com/calvadoz/email-notification-back-office) is connected during the time. You will notice a new line in the console that looks like this.

```bash
WebSocket client connected
```

Congratulation ! You have now successfully run the backend application.

To test out the application, simply post a request to the `/api/hook` endpoint, example using **curl**

```bash
curl -X POST -H "Content-Type: application/json" -d '{ "payload": {"to": "test@example.com", "subject": "custom title emails"} }' http://localhost:4000/api/hook
```

7. To run test, simply execute the script in the `package.json`
```bash
pnpm test
or
yarn test
or
npm test
```
*Disclaimer: As of now the unit test is only on core functions, however if you see any console error, don't panic as I don't have enough time to fix my test at the moment. The test is still success but I probably left out some asynchronous process opened during the test which cause it to yell at me. This is due to the webscoket that was implemented at last :(*

## Database Schema
This application make use of MongoDB Database to store any successful email notification requests. Schema / Model for the email notification looks like this

```json
{
  _id: ObjectId,
  payload: Object,
  status: String,
  timestamp: Date
}
```

Example of successful entry in mongo collection:
```json
{
  "_id": { "$oid": "64aa691e145b44c86b10079c" },
  "payload": {
    "to": "test@example.com",
    "subject": "custom title emails"
  },
  "status": "delivered",
  "timestamp": { "$date": { "$numberLong": "1688889630398" } },
  "__v": { "$numberInt": "0" }
}

```

## Future Enhancements
Due to time constraint, this application is delivered with the concept of **MVP (Minimum Viable Product)** which means is a development technique which introduce a new product in the terms of Proof of Concept to realize if the idea is marketable by using only very short period of time of development. Remember *fail fast, fail often*.

### Here are the list of shortcomings
- Implement authentication and authorization for secure access to the API.
- Add more logging and error handling for better troubleshooting
- Implement **GraphQL** / **tRPC** to introduce BFF (Backend For Frontend) design pattern also to emphasize schema-first approach to eliminate downstream error and also enhance developer experience (DevX)
- Implement background jobs / scheduler using probably lambda or any serverless technology to retriggered pending / failed email sending
- Provide more comprehensive API documentation