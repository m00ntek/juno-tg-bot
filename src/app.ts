import telegram from 'node-telegram-bot-api';
import { extname } from 'path';
import { getWasmClient } from './client';
import { getFileBuffer } from './util';
import * as dotenv from 'dotenv';
dotenv.config();



const token = process.env.TELEGRAM_TOKEN || "YOUR_TELEGRAM_BOT_TOKEN";
const wallet = process.env.WALLET || "YOUR_MNEMONIC";

const Bot = new telegram(token, { polling: true });

Bot.onText(/\/start/, (msg) => {
  if (!msg.from) return Bot.sendMessage(msg.chat.id, "I not accept you!");
  Bot.sendMessage(msg.chat.id, "Wellcome to Juno Bot, ask me something");
});

Bot.on("document", async (msg) => {
    const fileId = msg.document?.file_id;
    const filename = msg.document?.file_name;
    if (!fileId || !filename) return;

    // validate ext filename
    if (extname(filename).toLowerCase() !== ".wasm") {
        await Bot.sendMessage(msg.chat.id, "Invalid file: " + filename);
        return; 
    }

    try {
        const wasmData = await getFileBuffer(Bot, fileId);

        const [client, address] = await getWasmClient(wallet);
        const response = await client.upload(
            address,
            wasmData, 
            undefined, // { source: "https://crates.io/download/file.wasm", builder: "cosmwasm/rust-optimizer:0.11.3"}
            "Tg bot" // memo
        );

        const textReply = `Your CODE ID: <a href="https://blueprints.juno.giansalex.dev/#/codes/${response.codeId}">${response.codeId}</a>`;
        await Bot.sendMessage(msg.chat.id, textReply, {
            parse_mode: 'HTML'
        });
    } catch (error) {
        await Bot.sendMessage(msg.chat.id, "ERROR: `" + error.message + "`", { parse_mode: 'Markdown'});   
    }
});

