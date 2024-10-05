import { Job, Processor } from "bullmq";
import { createQueue } from "../index.js";
import { cleanRemoteFiles } from "./clean-remote-files.js";
import { deleteFile } from "./delete-file.js";

const processors = {
	cleanRemoteFiles,
	deleteFile,
} as Record<string, Processor>;

async function process(job: Job<any>): Promise<string> {
	const processor = processors[job.name];
	if (processor === undefined) return "skip: unknown job name";
	return await processor(job);
}

export const [objectStorageQueue, objectStorageInit] =
	createQueue("objectStorage", process, { concurrency: 16 });

export function createDeleteObjectStorageFileJob(key: string) {
	return objectStorageQueue.add(
		"deleteFile",
		{
			key: key,
		},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}

export function createCleanRemoteFilesJob() {
	return objectStorageQueue.add(
		"cleanRemoteFiles",
		{},
		{
			removeOnComplete: true,
			removeOnFail: true,
		},
	);
}
