import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { db } from "@/infra/db";
import { schema } from "@/infra/db/schemas";
import { isLeft, isRight, unwrapEither } from "@/infra/shared/either";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { InvalidaFileFormat } from "./errors/invalid-file-format";
import { uploadImage } from "./upload-image";

describe("upload image", () => {
	beforeAll(() => {
		vi.mock("@/infra/storage/upload-file-to-storage", () => {
			return {
				uploadFileToStorage: vi.fn().mockImplementation(() => {
					return {
						key: `${randomUUID()}.jpg`,
						url: "https://storage.test/image.jpg",
					};
				}),
			};
		});
	});

	it("should be able to upload an image", async () => {
		const mockFileProperties = {
			fileName: `${randomUUID()}.jpg`,
			contentType: "image/jpg",
			contentStream: Readable.from([]),
		};

		const sut = await uploadImage({
			fileName: mockFileProperties.fileName,
			contentType: mockFileProperties.contentType,
			contentStream: mockFileProperties.contentStream,
		});

		expect(isRight(sut)).toBe(true);

		const result = await db
			.select()
			.from(schema.uploads)
			.where(eq(schema.uploads.name, mockFileProperties.fileName));

		expect(result).toHaveLength(1);
	});

	it("should NOT be able to upload an image", async () => {
		const mockFileProperties = {
			fileName: `${randomUUID()}.jpg`,
			contentType: "document/pdf",
			contentStream: Readable.from([]),
		};

		const sut = await uploadImage({
			fileName: mockFileProperties.fileName,
			contentType: mockFileProperties.contentType,
			contentStream: mockFileProperties.contentStream,
		});

		expect(isLeft(sut)).toBe(true);
		expect(unwrapEither(sut)).toBeInstanceOf(InvalidaFileFormat);
	});
});
