# CSHub

CSHub started as project made for the TU Delft CSE study to post information, summaries and more, public for everyone.

## Status

[![Build Status](https://travis-ci.com/finitum/CSHub.svg?branch=dev)](https://travis-ci.com/finitum/CSHub)

## Naming

CSHub was the **C**omputer **S**cience Hub in the first place, but because other studies can use it as well, it is now the **C**ourse **S**ummary Hub.

## Structuring

The project is divided into different sections: 

* Client
* Server
* Shared

## Requirements

For this project to run, you need to have [NodeJS](https://nodejs.org/en/) installed.

## Installation

To install both client and server, run `npm install` in the correct directory.

## Run

For the sever:
`ts-node`

(Or use provided IntelliJ runconfigs.)

For the client:
`yarn run serve`

## How does it work?
This project uses TypeScript. This is typed JavaScript, so we can use many advantages of typedness, and use object oriented programming constructs like classes.

In order to facilitate typed communication between server and client, we have a shared package. Here, many models of different parts of the app are defined, so we are sure an object has the properties we need.
It also defines how the api-calls function, as it provides classes that can be passed between server and client. These classes include a certain URL, which both the server and client use for their communication.
This makes sure that the client always calls a URL on the server which the server can handle.

For the api we make use of express, which gives us a request object we can work with. For the front-end, Vue.JS is used, though also with TypeScript, which is not the default. See the comments in the corresponding files for more information.