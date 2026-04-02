import { createReadStream, createWriteStream } from 'node:fs';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGunzip, createGzip } from 'node:zlib';

// 1
async function compressFile(filePath: string) {
    const outputFile = async () => {
        let counter = 0;
        while (true) {
            let outputFilePath =
                counter === 0
                    ? `${filePath}.zip`
                    : `${filePath}.${counter}.zip`;
            try {
                await access(outputFilePath);
                counter++;
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    return outputFilePath;
                } else {
                    console.log(`Error occured: ${error.message}`);
                }
            }
        }
    };

    try {
        const output = await outputFile();
        const gzip = createGzip();
        const source = createReadStream(filePath);
        const destination = createWriteStream(output);

        await pipeline(source, gzip, destination);
        return output;
    } catch (error: any) {
        console.error(`Error while compressing a file: ${error.message}`);
    }
}

(async () => console.log(await compressFile('src/index.txt')))();

// 2
async function decompressFile(
    compressedFilePath: string,
    destinationFilePath: string,
) {
    const outputFile = async () => {
        let counter = 0;
        const { dir, name, ext } = path.parse(destinationFilePath);
        while (true) {
            let outputFilePath =
                counter === 0
                    ? destinationFilePath
                    : path.join(dir, `${name}.${counter}${ext}`);
            try {
                await access(outputFilePath);
                counter++;
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    return outputFilePath;
                } else {
                    console.log(`Error occured: ${error.message}`);
                }
            }
        }
    };

    try {
        const output = await outputFile();
        const sourse = createReadStream(compressedFilePath);
        const destination = createWriteStream(output);
        const gunzip = createGunzip();
        await pipeline(sourse, gunzip, destination);
        return output;
    } catch (error: any) {
        console.log(`Error while decompressing a file: ${error.message}`);
    }
}

async function performCompressionAndDecompression() {
    try {
        const compressedResult = await compressFile('./src/index.txt');
        if (!compressedResult) throw new Error('Compression failed');
        console.log(compressedResult);
        const decompressedResult = await decompressFile(
            compressedResult,
            './src/index_decompressed.txt',
        );
        console.log(decompressedResult);
    } catch (error: any) {
        console.error(
            `Error while decompressing or compressing a file: ${error.message}`,
        );
    }
}
performCompressionAndDecompression();
