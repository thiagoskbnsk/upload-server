import { randomUUID } from "node:crypto";
import { getUploads } from "@/app/functions/get-uploads";
import { isRight, unwrapEither } from "@/infra/shared/either";
import { makeUpload } from "@/test/factories/make-upload";
import dayjs from "dayjs";
import { describe, expect, it } from "vitest";

describe("get uploads", () => {
	it("should be able to get the uploads", async () => {
		const namePattern = randomUUID();

		const uploads = await Promise.all([
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
		]);

		const sut = await getUploads({
			searchQuery: namePattern,
		});

		expect(isRight(sut)).toBe(true);
		expect(unwrapEither(sut).total).toEqual(uploads.length);
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: uploads[4].id }),
			expect.objectContaining({ id: uploads[3].id }),
			expect.objectContaining({ id: uploads[2].id }),
			expect.objectContaining({ id: uploads[1].id }),
			expect.objectContaining({ id: uploads[0].id }),
		]);
	});

	it("should be able to get paginated uploads", async () => {
		const namePattern = randomUUID();

		const uploads = await Promise.all([
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
			makeUpload({ name: `${namePattern}.wep` }),
		]);

		let sut = await getUploads({
			searchQuery: namePattern,
			page: 1,
			pageSize: 3,
		});

		expect(isRight(sut)).toBe(true);
		expect(unwrapEither(sut).total).toEqual(uploads.length);
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: uploads[4].id }),
			expect.objectContaining({ id: uploads[3].id }),
			expect.objectContaining({ id: uploads[2].id }),
		]);

		sut = await getUploads({
			searchQuery: namePattern,
			page: 2,
			pageSize: 3,
		});

		expect(isRight(sut)).toBe(true);
		expect(unwrapEither(sut).total).toEqual(uploads.length);
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: uploads[1].id }),
			expect.objectContaining({ id: uploads[0].id }),
		]);
	});

	it("should be able to get sorted uploads", async () => {
		const namePattern = randomUUID();

		const uploads = await Promise.all([
			makeUpload({
				name: `${namePattern}.wep`,
				createdAt: new Date(),
			}),
			makeUpload({
				name: `${namePattern}.wep`,
				createdAt: dayjs().subtract(1, "day").toDate(),
			}),
			makeUpload({
				name: `${namePattern}.wep`,
				createdAt: dayjs().subtract(2, "day").toDate(),
			}),
			makeUpload({
				name: `${namePattern}.wep`,
				createdAt: dayjs().subtract(3, "day").toDate(),
			}),
			makeUpload({
				name: `${namePattern}.wep`,
				createdAt: dayjs().subtract(4, "day").toDate(),
			}),
		]);

		let sut = await getUploads({
			searchQuery: namePattern,
			sortBy: "createdAt",
			sortDirection: "desc",
		});

		expect(isRight(sut)).toBe(true);
		expect(unwrapEither(sut).total).toEqual(uploads.length);
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: uploads[0].id }),
			expect.objectContaining({ id: uploads[1].id }),
			expect.objectContaining({ id: uploads[2].id }),
			expect.objectContaining({ id: uploads[3].id }),
			expect.objectContaining({ id: uploads[4].id }),
		]);

		sut = await getUploads({
			searchQuery: namePattern,
			sortBy: "createdAt",
			sortDirection: "asc",
		});

		expect(isRight(sut)).toBe(true);
		expect(unwrapEither(sut).total).toEqual(5);
		expect(unwrapEither(sut).uploads).toEqual([
			expect.objectContaining({ id: uploads[4].id }),
			expect.objectContaining({ id: uploads[3].id }),
			expect.objectContaining({ id: uploads[2].id }),
			expect.objectContaining({ id: uploads[1].id }),
			expect.objectContaining({ id: uploads[0].id }),
		]);
	});
});
