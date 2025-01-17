import { Readable } from "node:stream";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { makeLeft, makeRight } from "@/shared/either";
import type { Either } from "@/shared/either";
import { z } from "zod";
import { InvalidaFileFormat } from "./errors/invalid-file-format";

const uploadImageInput = z.object({
	fileName: z.string(),
	contentType: z.string(),
	contentStream: z.instanceof(Readable),
});

type UploadImageInput = z.input<typeof uploadImageInput>;

const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function uploadImage(
	input: UploadImageInput,
): Promise<Either<InvalidaFileFormat, { url: string }>> {
	const { contentStream, contentType, fileName } =
		uploadImageInput.parse(input);

	if (!allowedMimeTypes.includes(contentType)) {
		return makeLeft(new InvalidaFileFormat());
	}

	// TODO: carregar imagem para cloudflare

	await db.insert(schema.uploads).values({
		name: fileName,
		remoteKey: fileName,
		remoteUrl: fileName,
	});

	return makeRight({ url: "" });
}
