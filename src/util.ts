
import telegram from 'node-telegram-bot-api';

export function getFileBuffer(bot: telegram, fileId: string): Promise<Buffer> {
    const stream = bot.getFileStream(fileId);
    return new Promise((resolve, reject) => {
        
        const buff = new Array();

        stream.on("data", (chunk) => buff.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(buff)));
        stream.on("error", (err) => reject(err));
    });
} 