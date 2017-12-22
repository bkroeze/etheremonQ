#! /usr/bin/env node
/**
 * etheremonQ
 *
 * A simple query tool for etheremon.
 *
 * Copyright 2017, Bruce Kroeze <bkroeze@gmail.com>
 */

var Web3 = require('web3');

var CONTRACTS = {
  "rinxby": 'unknown',
  'main': '0x8a60806f05876f4d6db00c877b0558dbcad30682'
};

var ABI = [{"constant":true,"inputs":[{"name":"_trainer","type":"address"}],"name":"getTrainerBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

class Client {
  constructor(params) {
    var contract = params.contract;
    var network = params.rinxby ? "rinxby" : "main";

    if (!contract) {
      contract = CONTRACTS[network];
    }
    this.contractAddress = contract;
  }

  /**
   * Gets balance on account in Wei
   * @param  {string} account [description]
   * @return {Promise} promise resolving to the balance in wei
   */
  getBalance(account) {
    var contractAddress = this.contractAddress;
    var web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider('https://api.myetherapi.com/eth'));
    var contract = new web3.eth.Contract(ABI, contractAddress);
    return contract.methods.getTrainerBalance(account).call();
  }
}

function balanceCommand (args) {
  const client = new Client(args);
  client.getBalance(args.account)
    .catch(e => {
      console.log('Error', e);
    })
    .then(response => {
      var now = new Date().toLocaleString();
      var bal = Web3.utils.fromWei(response);
      console.log(`${now}: ${bal}`);
    });
}

function accountOptions (yargs) {
  return yargs
    .option('account', {alias: 'a', type: 'string'})
    .option('contract', {type: 'string', description: "contract address (override default if given)", default: null})
    .option('rinxby', {describe: 'Use Rinxby testnet', alias: 'r', type: 'boolean', default: false})
    .demandOption('account', 'Please provide account');
}

const USAGE = 'Query an Etheremon account\nUsage: etherermonQ balance';

var args = require('yargs')
  .usage(USAGE)
  .command({
    command: 'balance',
    desc: 'Get balance for Etheremon account',
    builder: accountOptions,
    handler: balanceCommand
  })
  .showHelpOnFail(false, 'Specify --help for available options')
  .demandCommand(1, USAGE + '\n\nI need at least one command, such as "balance"')
  .help()
  .parse();

// console.log(args);
