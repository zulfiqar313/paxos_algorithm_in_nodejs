# This is an Implementation of the Paxos Paper in JavaScript.

How to compile and run the project in a remote cluster:

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
