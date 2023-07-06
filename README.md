## How to start the app

This application is built with blockly library, reactjs, expressjs and mongoDB.

To run this project, install the dependencies for the for the backend and frontend with the following commands:

```bash
cd client && npm install
cd server && npm install
# or
cd client && yarn install
cd server && yarn install
```

After installing the dependencies, create a `/server/.env` file (within the `/server`) directory and the CONNECTION_URL, PORT, and SECRET variables to it. 

Your file should use something like the following:

```/server/.env
CONNECTION_URL=...
```

Modify the content in the `/server/.env.example` to get started.

Then, you can run the project by running the following two commands in separate terminals:

```bash
npm start
# or
yarn start
```
