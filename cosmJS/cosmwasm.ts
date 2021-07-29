import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
// import { calculateFee, gasPrice } from "@cosmjs/stargate";
import {
    coin,
    coins,
    GasPrice,
    MsgDelegate as LaunchpadMsgDelegate,
    Secp256k1HdWallet,
  } from "@cosmjs/launchpad";
import * as fs from "fs";

const rpcEndpoint = "https://rpc-juno.itastakers.com/";

// Upload contract
const wasm = fs.readFileSync();
const uploadFee = calculateFee(1_500_000, GasPrice);
const codeMeta = {
  source: "https://crates.io/api/v1/crates/hackatom/not-yet-released/download",
  builder: "cosmwasm/rust-optimizer:0.10.8",
};
const uploadReceipt = await client.upload(
  alice.address0,
  wasm,
  uploadFee,
  codeMeta,
  "Upload hackatom contract",
);
console.info("Upload succeeded. Receipt:", uploadReceipt);

// Instantiate
const instantiateFee = calculateFee(500_000, GasPrice);
// This contract specific message is passed to the contract
const msg = {
  beneficiary: alice.address1,
  verifier: alice.address0,
};
const { contractAddress } = await client.instantiate(
  alice.address0,
  uploadReceipt.codeId,
  msg,
  "My instance",
  instantiateFee,
  { memo: `Create a hackatom instance` },
);
console.info(`Contract instantiated at: `, contractAddress);

// Execute contract
const executeFee = calculateFee(300_000, GasPrice);
const result = await client.execute(alice.address0, contractAddress, { release: {} }, executeFee);
const wasmEvent = result.logs[0].events.find((e) => e.type === "wasm");
console.info("The `wasm` event emitted by the contract execution:", wasmEvent);


const repoRoot = process.cwd() + "/../.."; // This assumes you are in `packages/cli`
const hackatom = `${repoRoot}/scripts/wasmd/contracts/hackatom.wasm`;
await main(hackatom);
console.info("The show is over.");