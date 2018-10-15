import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

import getWeb3 from './utils/getWeb3'
import HuanCasino from './resources/contracts/HuanCasino.json'

const contract = require('truffle-contract')

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      web3: null,
      lastWinner: 0,
      numberOfBets: 0,
      minimumBet: 0,
      totalBet: 0,
      maxAmountOfBets: null,
      pending: false,
      betResults: []
    }

    window.currentState = this.state
  }

  componentDidMount() {
    // Get network provider and web3 instance
    // Setup contracts once web3 is available

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });
        this.setupContracts();
      })
      .catch(() => {
        console.log("Error finding web3.");
      });


    this.setupListeners()

    // setInterval(this.updateState.bind(this), 7e3)
  }

  setupContracts() {
    const { web3 } = this.state
    let huanCasinoContract = contract(HuanCasino)
    huanCasinoContract.setProvider(web3.currentProvider)

    huanCasinoContract.deployed().then(instance => {
      const casinoInstance = instance
      this.setState({ casinoInstance })
      this.fetchAccounts()
      this.updateState()
    })
  }

  updateState() {
    const { web3, casinoInstance } = this.state

    casinoInstance.minimumBet().then((result) => {
      if (result != null) {
        this.setState({
          minimumBet: parseFloat(web3.utils.fromWei(result.toString(), 'ether'))
        })
      }
    })
    casinoInstance.totalBet().then((result) => {
      if (result != null) {
        this.setState({
          totalBet: parseFloat(web3.utils.fromWei(result.toString(), 'ether'))
        })
      }
    })
    casinoInstance.numberOfBets().then((result) => {
      if (result != null) {
        this.setState({
          numberOfBets: parseInt(result.toString())
        })
      }
    })
    casinoInstance.numberWinner().then((result) => {
      if (result != null) {
        this.setState({
          lastWinner: parseInt(result.toString())
        })
      }
    })
  }

  fetchAccounts() {
    const { web3 } = this.state
    web3.eth.getAccounts((error, accounts) =>
      this.setState({ accounts })
    )
  }
  // Listen for events and executes the voteNumber method
  setupListeners() {
    let liNodes = this.refs.numbers.querySelectorAll('li')
    liNodes.forEach(number => {
      number.addEventListener('click', event => {
        event.target.className = 'number-selected'
        this.voteNumber(parseInt(event.target.innerHTML))
      })
    })
  }

  callbackVoteNumber() {
    let liNodes = this.refs.numbers.querySelectorAll('li')
    // Remove the other number selected
    for (let i = 0; i < liNodes.length; i++) {
      liNodes[i].className = ''
    }
  }

  watchResultBet() {
    const {
      casinoInstance,
      betResults
    } = this.state
    const wonEvent = casinoInstance.Won();
    wonEvent.watch((err, result) => {
      console.log('ERROR: ', err)
      console.log('RESULT: ', result)
      this.setState({ pending: false })
      if (err) {
        alert('Something wrong !!!, please try again later !')
        console.log('could not get event Won()')
      } else {
        let checkExits = betResults.filter((item) =>
          item.blockNumber === result.blockNumber
        )
        if (checkExits.length === 0)
          betResults.push(result)
          this.setState({ betResults })
      }
    })
  }

  voteNumber(number) {
    let bet = this.refs['ether-bet'].value
    const {
      web3,
      casinoInstance,
      minimumBet
    } = this.state
    if (!bet) bet = 0.1

    if (parseFloat(bet) < minimumBet) {
      alert('You must bet more than the minimum')
      this.callbackVoteNumber()
    } else {
      this.setState({ pending: true })
      casinoInstance.bet(number, {
        gas: 300000,
        from: this.state.accounts[0],
        value: web3.utils.toWei(bet.toString(), 'ether')
      }).then((result) => {
        this.callbackVoteNumber()
        this.watchResultBet()
      })
    }
  }

  parseWeiToEth(wei) {
    const { web3 } = this.state
    let result = wei ? web3.utils.fromWei(wei, 'ether') : 0
    return parseFloat(result)
  }

  render() {
    const { pending, betResults } = this.state
    return (
      <div className="main-container">
      <AppBar position='static'>
        <Toolbar className="toolBar">
          <Typography variant="title" className="toolBarText" variant="h4">
             ZeroS Dice - The destiny is in your hand
          </Typography>
        </Toolbar>
      </AppBar>

        <div className="main-container-content">
          <h1>Bet for your best number and win huge amounts of Ether</h1>
          <div className="block">
            <b>Number of bets:</b> &nbsp;
            <span>{this.state.numberOfBets}</span>
          </div>
          <div className="block">
            <b>Last number winner:</b> &nbsp;
            <span>{this.state.lastWinner}</span>
          </div>
          <div className="block">
            <b>Total ether bet:</b> &nbsp;
            <span>{this.state.totalBet} ether</span>
          </div>
          <div className="block">
            <b>Minimum bet:</b> &nbsp;
            <span>{this.state.minimumBet} ether</span>
          </div>
          <div className="block">
            <b>Max amount of bets:</b> &nbsp;
            <span>{this.state.maxAmountOfBets || 'Unlimited'}</span>
          </div>
          <hr/>
          <h2>Vote for the next number</h2>
          <label>
          <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet}/></b> ether
          <br/>
          </label>
          <ul ref="numbers" className="numberList">
            <li>1</li>
            <li>2</li>
            <li>3</li>
            <li>4</li>
            <li>5</li>
            <li>6</li>
            <li>7</li>
            <li>8</li>
            <li>9</li>
            <li>10</li>
          </ul>
        </div>
        <div className='container-bet-result'>
          {pending &&
            <div>
              <p>
                <img src={require('./assets/images/loading.svg')} width='70px' />
              </p>
              <span className='bet-edge-house' style={{color: '#d1ffe6'}}>Waiting for another bet of edge house......</span>
            </div>
          }
          {betResults.length > 0 &&
            <div>
              <h2>Result:</h2>
              {betResults.map((result, key) =>
                <div className='bet-result' key={key}>
                  <p>{result.args._status ? 'YOU WON' : 'YOU LOSE'}</p>
                  <p>Won amount: {this.parseWeiToEth(result.args._amount)} ETH.</p>
                </div>
              )}
            </div>
          }
        </div>
      </div>
    )
  }
}