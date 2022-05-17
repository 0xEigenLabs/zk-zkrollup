const buildMimc7 = require("circomlibjs").buildMimc7;
const buildEddsa = require("circomlibjs").buildEddsa;
const pc = require("@ieigen/anonmisc/lib/pedersen_babyJubjub.ts");

module.exports = class Account {
  constructor(
    _index = 0, _pubkeyX = 0, _pubkeyY = 0,
    _balanceCommX = 0, _balanceCommY = 0, _nonce = 0, _tokenType  = 0,
    _prvkey = 0
  ) {
    this.index = _index;
    this.pubkeyX = _pubkeyX;
    this.pubkeyY = _pubkeyY;
    this.balanceCommX = _balanceCommX;
    this.balanceCommY = _balanceCommY;
    this.nonce = _nonce;
    this.tokenType = _tokenType;

    this.prvkey = _prvkey;
    this.hash = undefined
    this.mimcjs = undefined
    this.eddsa = undefined
  }

  async initialize() {
    this.mimcjs = await buildMimc7()
    //this.eddsa = await buildEddsa()
    this.hash = this.hashAccount()
  }

  hashAccount(){
    let F = this.mimcjs.F
    let input = [
      // this.index.toString(),
      this.pubkeyX,
      this.pubkeyY,
      F.toString(this.balanceCommX),
      F.toString(this.balanceCommY),
      this.nonce,
      this.tokenType
    ]
    const accountHash = this.mimcjs.multiHash(input)
    return accountHash
  }

  async debitAndIncreaseNonce(amountCommX, amountCommY){
    let res = await pc.sub([this.balanceCommX, this.balanceCommY], [amountCommX, amountCommY]);
    this.balanceCommX = res[0]
    this.balanceCommY = res[1]
    this.nonce++;
    this.hash = this.hashAccount()
  }

  async credit(amountCommX, amountCommY){
    if (this.index > 0){ // do not credit zero leaf
      let res = await pc.add([this.balanceCommX, this.balanceCommY], [amountCommX, amountCommY])
      this.balanceCommX = res[0]
      this.balanceCommY = res[1]
      this.hash = this.hashAccount()
    }
  }

}




