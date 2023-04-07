import { ethers } from "hardhat";
import { Contract } from "ethers";
import { expect } from "chai";
const cls = require("circomlibjs");
import { deployPoseidonFacade } from "../src/deploy_poseidons.util";
import { poseidonSponge } from "../src/sponge_poseidon";

describe("poseidon", () => {
    let spongePoseidon: Contract;
    let poseidon: any;

    before(async () => {
        let [admin] = await ethers.getSigners();
        spongePoseidon = await deployPoseidonFacade(ethers, admin);
        poseidon = await cls.buildPoseidon();
    });

    it("check poseidon hash function with inputs [1, 2, 3, 4, 5, 6]", async () => {
        // poseidon goiden3 [extracted using go-iden3-crypto/poseidon implementation]
        const resGo = "20400040500897583745843009878988256314335038853985262692600694741116813247201";
        let values = [1n, 2n, 3n, 4n, 5n, 6n];
        const resSC = await spongePoseidon.poseidon6(values);
        let resJS = poseidon.F.toObject(poseidon(values));
        console.log(resSC)
        expect(resSC).to.be.equal(resGo);
        expect(resSC).to.be.equal(resJS);
    });

    it("check with input 1", async() => {
        const resGo = "18586133768512220936620570745912940619677854269274689475585506675881198879027";
        let values = [1n];
        const resSC = await spongePoseidon.poseidon1(values);
        let resJS = poseidon.F.toObject(poseidon(values));
        console.log(resSC)
        expect(resSC).to.be.equal(resGo);
        expect(resSC).to.be.equal(resJS);
    })

    it("check poseidon hash function with inputs [1, 2, 3, 4, 5, 6, 7, 8]", async () => {
        //let values = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n];
        //let values = [1n, 2n, 3n, 4n, 5n, 6n];
        let values = new Array(20).fill(0).map((_, i) => BigInt(i+1));
        const resSC = await spongePoseidon.poseidonSponge(values);
        const resJS = await poseidonSponge(values);
        expect(resSC).to.be.equal(resJS);
    });

    it("check sponge poseidon hash function with inputs", async () => {
    // poseidon goiden3 [extracted using go-iden3-crypto/poseidon implementation]

    const expectedSpongeHashes = [
      "7757418611592686851480213421395023492910069335464834810473637859830874759279",
      "15336558801450556532856248569924170992202208561737609669134139141992924267169",
      "1144067817111460038464347636467015864025755473684726783913963849059920017972",
      "17412321031092738336952455023828291176350572898965143678124844674611030278684",
      "6186895146109816025093019628248576250523388957868658785525378722128520330607",
      "20400040500897583745843009878988256314335038853985262692600694741116813247201",
      "5577102071379540901883430718956859114277228199376926918690006383418752242436",
      "1152305401687934645444055619201663931885907446826162025284948369145242973368",
      "8211686227523893359273736667704216885003209084307215502943363750368107369620",
      "7108881484930248270303049372327318360896856726757123411260066018366897025567",
      "2265321027947983264707184154085264659877433648022878713272356019112959947364",
      "12651359110916308876830620694657526370832930110397701742810260795463743022206",
      "5448696623590242880008365208951082811870613001921911478755586779573529615712",
      "12138957412533147284529235731676849096990688866708298976199544475739215311830",
      "4296304251107177078079123684673490646100950885652358062546507066452904816259",
      "5605330091169856132381694679994923791994681609858984566508182442210285386845",
      "13988934542900192765733497388343315006075364569889174469414974142779436870312",
      "15403024279602420951485303794282139684443426339931496210157338841814828581711",
      "21456291545549982243960095968662564139932500401819177068272967144559313156981",
      "18204869441381241555967353898895621136239168759533159329850061388567652528934",
      "13038015408593191211490686165474468640092531721798660195788216465453248480728",
      "12309272263327599345161647951693718299307241536286565003086196302911971469604",
      "10840650818402135724326351346136445930685630730269985605010393908994564824235",
      "21849737353910188382088824684436227618056412351076455250257806935905067632365",
      "8187515096456689801413737265706614153618279301909753441748648001736700414715",
      "4755440640607989103349383219998930990478310704060877434697432110516035330006",
      "3417727050968712119309244192597476175394430045239022300352303927783425142176",
      "4566829072137519794439015258119246934688085975903192308372043866350635718529",
      "2305104968398791940447593647955635080385830922007029758987004541441998383686",
      "17493129748111347200148982095457072729362691908049960672923376976364550113866",
      "3635020590903860031120537553848807680716799009888195893393146404779714194994",
      "19959950255042159884516551790142967110471962214148178017303673898104098763104",
      "4314770996498537770591484346383271479949872488466541901562145191643303518218",
      "16659359007482541913628282019811836379515861742407853596872501509074813746034",
      "14327962284814531234188246461594183590858637201545292060368954728320283343357",
      "10447075419106080186437683452928610279117864159183545248343178863781932672934",
      "1362179717229057270865163536549572405088177136726630892094624123574033537900",
      "6562004893941939580705272604801737705917815093268566511155901940216356605559",
      "10551288450918623649199076965013840265832039168021663355958902225655282404565",
      "11089846129533556294501836817630288198784828026286644467868475197175285064257",
      "734194004228041566834389257878806747128144721206999111331346907285399198093",
      "15453246007413592894994052056189504931596869378720796254186083890034315683271",
      "14930743011745380472827539825298308928576986968662249646825944671013914580841",
      "6822810469207228926573027566092443611631514245644522254380047883923091850495",
      "572256611333939647870071795094991346875682904248480845061433474146479504943",
    ];
    for (let i = 1; i <= expectedSpongeHashes.length; i++) {
      const vector: bigint[] = new Array(i).fill(1).map((_, i) => BigInt(i + 1));
      const resSC = await spongePoseidon.poseidonSponge(vector);
      expect(resSC.toString()).to.be.equal(expectedSpongeHashes[i - 1]);
      const resJS = await poseidonSponge(vector);
      expect(resSC).to.be.equal(resJS);
    }
  });
});
