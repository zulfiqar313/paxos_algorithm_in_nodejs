const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

let proposersList = [];
let acceptorsList = [];
let learnersList = [];

const noOfProposer = parseInt(process.argv[2]);
const noOfAcceptors = parseInt(process.argv[3]);
const noOfLearners = parseInt(process.argv[4]);
const noOfCrash = parseInt(process.argv[5]);

for (let i = 1; i <= noOfProposer; i++) {
  proposersList.push(5000 + i);
}

for (let i = 1; i <= noOfAcceptors; i++) {
  acceptorsList.push(4000 + i);
}

for (let i = 1; i <= noOfLearners; i++) {
  learnersList.push(3000 + i);
}

function createProposer(portNumber) {
  const proposer = express();

  proposer.listen(portNumber, () => {
    console.log(`I am  a proposer running on port ${portNumber}`);
  });
}

for (let i = 0; i < proposersList.length; i++) {
  createProposer(proposersList[i]);
}

function createAcceptor(portNumber) {
  const acceptor = express();
  acceptor.use(bodyParser.json());
  acceptor.use(bodyParser.urlencoded({ extended: false }));
  let acceptedInformation = {};

  acceptor.post("/prepare", (req, res) => {
    let data = req.body;

    if (Object.keys(acceptedInformation).length === 0) {
      acceptedInformation = data;
      console.log(
        `I am an acceptor listening at ${portNumber} and I have not accepted any previous proposal. I accept new value as ${acceptedInformation.proposedValue}.`
      );
      setTimeout(() => {
        res.send(acceptedInformation);
      }, "200");
    } else if (
      parseInt(data.proposalNumber) >
      parseInt(acceptedInformation.proposalNumber)
    ) {
      console.log(
        `I am an acceptor listening at ${portNumber} and I have already accepted the value ${acceptedInformation.proposedValue} but now I recieved a greater value that is ${data.proposedValue}`
      );
      const previousData = acceptedInformation;
      acceptedInformation = data;
      setTimeout(() => {
        res.send(previousData);
      }, "200");
    }
  });

  acceptor.post("/accept", (req, res) => {
    let data = req.body;
    if (data.crash) {
      setTimeout(() => {
        res.status(500).send("I am crashed");
      }, "200");
    } else {
      if (
        parseInt(acceptedInformation.proposalNumber) ===
        parseInt(data.proposalNumber)
      ) {
        console.log(
          `I am an acceptor listening at ${portNumber} and I already accepted the same value as ${acceptedInformation.proposedValue}.`
        );
        setTimeout(() => {
          res.send(acceptedInformation);
        }, "200");
      } else {
        console.log(
          `I am an acceptor listening at ${portNumber} and I recieved the value ${data.proposedValue} but I have already accepted a greater value`
        );
        setTimeout(() => {
          res.send("value not accepted");
        }, "200");
      }
    }
  });

  acceptor.listen(portNumber, () => {
    console.log(`I am  acceptor running on port ${portNumber}`);
  });
}

for (let i = 0; i < acceptorsList.length; i++) {
  createAcceptor(acceptorsList[i]);
}

function createLearner(portNumber) {
  const learner = express();
  learner.use(bodyParser.json());
  learner.use(bodyParser.urlencoded({ extended: false }));

  learner.post("/accepted", (req, res) => {
    const data = req.body;
    res.send(
      `I am a learner listening at ${portNumber} and I  have recieved the value ${data.proposedValue}.`
    );
  });

  learner.listen(portNumber, () => {
    console.log(`I am  a learner running on port ${portNumber}`);
  });
}

for (let i = 0; i < learnersList.length; i++) {
  createLearner(learnersList[i]);
}

function prepareRequest() {
  const promises = [];
  for (let i = 0; i < proposersList.length; i++) {
    for (let j = 0; j < acceptorsList.length; j++) {
      promises.push(
        axios
          .post(`http://localhost:${acceptorsList[j]}/prepare`, {
            proposalNumber: `${i}` + 1,
            proposedValue: i,
            crash: false,
          })
          .then((res) => {
            if (res?.data) {
              return res?.data;
            }
          })
          .catch((err) => {
            console.error(err);
          })
      );
    }
  }

  Promise.all(promises)
    .then(() => {
      acceptRequest();
    })
    .catch((err) => {
      console.error(err);
    });
}

function acceptRequest() {
  const accepted = [];
  let acceptedValue = [];

  for (let i = 0; i < proposersList.length; i++) {
    for (let j = 0; j < acceptorsList.length; j++) {
      accepted.push(
        axios
          .post(`http://localhost:${acceptorsList[j]}/accept`, {
            proposalNumber: `${i}` + 1,
            proposedValue: i,
            crash: j < noOfCrash ? true : false,
          })
          .then((res) => {
            if (typeof res.data === "object") {
              acceptedValue.push(res.data);
            }
          })
          .catch((err) => console.error(err.message))
      );
    }
  }
  Promise.all(accepted)
    .then(() => {
      if (acceptedValue.length >= Math.floor(acceptorsList.length / 2 + 1)) {
        for (let j = 0; j < learnersList.length; j++) {
          axios
            .post(
              `http://localhost:${learnersList[j]}/accepted`,
              acceptedValue[0]
            )
            .then((res) => {
              console.log(res.data);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      } else {
        console.log(
          "There is a network crash as more than half acceptors are not active"
        );
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

prepareRequest();
