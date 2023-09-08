# Paxos Paper Implementation in JavaScript

This project is an implementation of the Paxos consensus algorithm in JavaScript. Paxos is a fundamental algorithm used to achieve distributed consensus in distributed systems. It ensures that a group of nodes (often referred to as acceptors and proposers) can agree on a single value even in the presence of network failures and node crashes.

## Getting Started

To compile and run the project on a remote cluster, follow these steps:

=> Download the NVM in cluster:

1. curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
2. restart terminal.

=> Install NODE and the packages:

1. nvm install node
2. npm install

=> Run the project:

To run in normal manner.

1. sh ./startNormal.sh
   To run with two acceptors crashed.
2. sh ./startFail.sh
