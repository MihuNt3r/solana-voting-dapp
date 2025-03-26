/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solanavotingdapp.json`.
 */
export type Solanavotingdapp = {
  "address": "GGS4omi8yEeDXxi3mRAjpJg4uKKhvBrKmRHp1RmoK134",
  "metadata": {
    "name": "solanavotingdapp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializePoll",
      "discriminator": [
        193,
        22,
        99,
        197,
        18,
        33,
        115,
        117
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "pollAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "pollName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollName",
          "type": "string"
        },
        {
          "name": "pollDescription",
          "type": "string"
        },
        {
          "name": "candidates",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "vote",
      "discriminator": [
        227,
        110,
        155,
        23,
        136,
        126,
        172,
        25
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "voterAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "pollName"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "pollAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "pollName"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "pollName",
          "type": "string"
        },
        {
          "name": "candidate",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "pollAccount",
      "discriminator": [
        109,
        254,
        117,
        41,
        232,
        74,
        172,
        45
      ]
    },
    {
      "name": "voterAccount",
      "discriminator": [
        24,
        202,
        161,
        124,
        196,
        184,
        105,
        236
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidPollName",
      "msg": "Poll name cannot be empty or exceed 32 characters"
    },
    {
      "code": 6001,
      "name": "invalidPollDescription",
      "msg": "Poll description cannot be empty or exceed 280 characters"
    },
    {
      "code": 6002,
      "name": "invalidCandidateName",
      "msg": "Candidate name cannot be empty or exceed 32 characters"
    },
    {
      "code": 6003,
      "name": "votingAlreadyExists",
      "msg": "Voting with the same name already exists"
    },
    {
      "code": 6004,
      "name": "incorrectAmountOfCandidates",
      "msg": "Incorrect amount of candidates"
    },
    {
      "code": 6005,
      "name": "candidateNotFound",
      "msg": "Candidate not found"
    },
    {
      "code": 6006,
      "name": "alreadyVoted",
      "msg": "Already voted"
    }
  ],
  "types": [
    {
      "name": "candidate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "candidateName",
            "type": "string"
          },
          {
            "name": "candidateVotes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "pollAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pollName",
            "type": "string"
          },
          {
            "name": "pollDescription",
            "type": "string"
          },
          {
            "name": "proposals",
            "type": {
              "vec": {
                "defined": {
                  "name": "candidate"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "voterAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "votedFor",
            "type": "string"
          }
        ]
      }
    }
  ]
};
