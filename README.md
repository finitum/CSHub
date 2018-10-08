# CSEDelft [![Build Status](https://travis-ci.com/RobbinBaauw/FAQSite.svg?branch=master)](https://travis-ci.com/RobbinBaauw/FAQSite)
This is a project made for the TU Delft CSE studies, where everyone can post information, summaries and more, for everyone to see and read.
## Running the project
* Install [NodeJS](https://nodejs.org/en/), and install the dependencies of the server and client projects
* For the server, run `ts-node`, or use the provided IntelliJ runconfigs
* For the client, run `npm run serve`

## Feature Requests / Bug Reports

Create a GitHub issue on this repository, and we will try to take a look at it.

## How does it work?
This project uses TypeScript. This is typed JavaScript, so we can use many advantages of typedness, and use object oriented programming constructs like classes.

The project is divided into different sections: 

* Client
* Server
* Shared

In order to facilitate typed communication between server and client, we have a shared package. Here, many models of different parts of the app are defined, so we are sure an object has the properties we need.
It also defines how the api-calls function, as it provides classes that can be passed between server and client. These classes include a certain URL, which both the server and client use for their communication.
This makes sure that the client always calls a URL on the server which the server can handle.

For the api we make use of express, which gives us a request object we can work with. For the front-end, Vue.JS is used, though also with TypeScript, which is not the default. See the comments in the corresponding files for more information.
