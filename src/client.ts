import { makeCosmoshubPath } from "@cosmjs/amino";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from "@cosmjs/proto-signing";

const rpcEndpoint = "https://rpc-juno.itastakers.com/";
const addressPrefix = "juno";

export async function getWasmClient(mnemonic: string): Promise<[SigningCosmWasmClient, string]> {
    const gasPrice = GasPrice.fromString("0.25ujuno");
    const offlineSigner = await loadWalletDirect(addressPrefix, mnemonic);
    const client = await SigningCosmWasmClient.connectWithSigner(
        rpcEndpoint,
        offlineSigner,
        {
            gasPrice: gasPrice
        }
    );
    const address = (await offlineSigner.getAccounts())[0].address;

    return [client, address];
}

function loadWalletDirect(
    addressPrefix: string,
    mnemonic: string,
): Promise<OfflineDirectSigner> {
    const hdPath = makeCosmoshubPath(0);
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        hdPaths: [hdPath],
        prefix: addressPrefix,
    });
}