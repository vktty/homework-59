import { createReadStream, createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGunzip, createGzip } from 'node:zlib';
import crypto from 'crypto';
import { Transform } from 'node:stream';

type TransformFile = () => Transform;

const createOutputFile = (file: string, extention?: string) => {
	const { dir, name, ext } = path.parse(file);
	const uniqueId = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
	const newFileName = `${name}-${uniqueId}${extention}`;
	return path.join(dir, newFileName);
};

const processFile = async (
	path: string,
	extension: string,
	transformFile: TransformFile,
	destination?: string,
) => {
	try {
		const output = destination
			? createOutputFile(destination, extension)
			: createOutputFile(path, extension);

		const transform = transformFile();
		const source = createReadStream(path);
		const destinationStream = createWriteStream(output);

		await pipeline(source, transform, destinationStream);

		return output;
	} catch (error: any) {
		console.error(
			`Error while processing a file: ${error.message}`,
		);
	}
};

// 1
async function compressFile(filePath: string) {
	return processFile(filePath, '.zip', createGzip);
}

(async () => {
	const result = await compressFile('src/index.txt');
	console.log(result);
})();

// 2
async function decompressFile(
	compressedFilePath: string,
	destinationFilePath: string,
) {
	return processFile(
		compressedFilePath,
		'.txt',
		createGunzip,
		destinationFilePath,
	);
}

async function performCompressionAndDecompression() {
	try {
		const compressedResult = await compressFile('./src/index.txt');
		if (!compressedResult) throw new Error('Compression failed');
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
