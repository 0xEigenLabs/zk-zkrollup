import { test, utils } from "../index";
import { Note } from "../src/note";
import { assert, expect } from "chai";
import { ethers } from "ethers";
import { compress as accountCompress, SigningKey } from "../src/account";
import { WorldState } from "../server/state_tree";
import { JoinSplitCircuit } from "../src/join_split";
import { getPublicKey, sign as k1Sign, verify as k1Verify, Point } from "@noble/secp256k1";
import { SMTModel } from "../server/state_tree";
const path = require("path");

const { buildEddsa, buildBabyjub } = require("circomlibjs");

describe("Test JoinSplit Circuit", function () {
    let circuit: any;
    let eddsa: any;
    let babyJub: any;
    let F: any;
    let accountKey: SigningKey;
    let signingKey: SigningKey;
    let aliasHash: bigint = 123n;
    let acStateKey: any;
    let assetId: number = 1;
    let signer: any;
    let accountRequired: boolean = false;

    before(async () => {
        eddsa = await buildEddsa();
        babyJub = await buildBabyjub();
        F = babyJub.F;
        let third = path.join(__dirname, "../third-party");
        circuit = await test.genTempMain("circuits/join_split.circom",
            "JoinSplit", "proof_id, public_value, public_owner, num_input_notes, output_nc_1, output_nc_2, data_tree_root, public_asset_id", "20", {include: third});
        accountKey = await (new SigningKey()).newKey(undefined);
        signingKey = await (new SigningKey()).newKey(undefined);
        signer = accountRequired? signingKey: accountKey;
        acStateKey = await accountCompress(eddsa, accountKey, signer, aliasHash);
        await (await WorldState.getInstance()).insert(acStateKey, 1n);
    })

    it("JoinSplit deposit and send test", async () => {
        let proofId = JoinSplitCircuit.PROOF_ID_TYPE_DEPOSIT;
        let inputs = await JoinSplitCircuit.createDepositInput(
            accountKey,
            signingKey,
            acStateKey,
            proofId,
            aliasHash,
            assetId,
            assetId,
            10n,
            signingKey.pubKey,
            accountKey.pubKey,
            [],
            accountRequired
        );

        for (const input of inputs) {
            const proof = await WorldState.updateStateTree(
                input.outputNCs[0],
                input.outputNotes[0].inputNullifier,
                input.outputNCs[1],
                input.outputNotes[1].inputNullifier,
                acStateKey
            );
            console.log(proof);
            await utils.executeCircuit(circuit, input.toCircuitInput(babyJub, proof));
        }
        let confirmedNote: Note[] = [];
        for (const inp of inputs) {
            confirmedNote.push(inp.outputNotes[0]); // after depositing, all balance becomes private value
            confirmedNote.push(inp.outputNotes[1]);
        }

        // create a send proof
        let noteReceiver = await (new SigningKey()).newKey(undefined);
        proofId = JoinSplitCircuit.PROOF_ID_TYPE_SEND;
        let inputs2 = await JoinSplitCircuit.createProofInput(
            accountKey,
            signingKey,
            acStateKey,
            proofId,
            aliasHash,
            assetId,
            0, // public assetId
            0n, // public value
            undefined, // public owner
            5n, // receiver private value
            noteReceiver.pubKey,
            confirmedNote,
            accountRequired
        );
        console.log("get SMT", inputs2.length);
        for (const input of inputs2) {
            const proof = await WorldState.updateStateTree(
                input.outputNCs[0],
                input.outputNotes[0].inputNullifier,
                input.outputNCs[1],
                input.outputNotes[1].inputNullifier,
                acStateKey
            );
            await utils.executeCircuit(circuit, input.toCircuitInput(babyJub, proof));
        }
    })
});
