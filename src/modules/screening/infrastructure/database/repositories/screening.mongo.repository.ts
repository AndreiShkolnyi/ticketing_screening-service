import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ScreeningEntity } from 'src/modules/screening/domain/entities/screeening.entity'
import { ScreeningRepositoryPort } from 'src/modules/screening/domain/ports/screeening.repository.port'

import { ScreeningMapper } from '../../mappers/screening.mapper'
import { ScreeningDocument, ScreeningModel } from '../schemas/screening.schema'

@Injectable()
export class ScreeningMongoRepository implements ScreeningRepositoryPort {
	public constructor(
		@InjectModel(ScreeningModel.name)
		private readonly screening: Model<ScreeningDocument>
	) {}

	public async findOverlap(
		hallId: string,
		startAt: Date,
		endAt: Date
	): Promise<ScreeningEntity | null> {
		{
			const doc = await this.screening
				.findOne({
					hallId,
					startAt: { $lt: endAt },
					endAt: { $ft: startAt }
				})
				.lean()
				.exec()

			return doc ? ScreeningMapper.toEntity(doc) : null
		}
	}

	public async create(entity: ScreeningEntity): Promise<ScreeningEntity> {
		const persistence = ScreeningMapper.toPersistence(entity)

		const doc = new this.screening(persistence)
		await doc.save()

		return ScreeningMapper.toEntity(doc.toObject())
	}

	public async findById(
		screeningId: string
	): Promise<ScreeningEntity | null> {
		const doc = await this.screening.findById(screeningId).lean().exec()

		return doc ? ScreeningMapper.toEntity(doc) : null
	}

	public async findByDateRange(
		dayStart: Date,
		dayEnd: Date,
		hallIds?: string[]
	): Promise<ScreeningEntity[]> {
		const query: Record<string, unknown> = {
			startAt: { $gte: dayStart, $lt: dayEnd }
		}

		if (hallIds?.length) {
			query.hallId = { $in: hallIds }
		}

		const docs = await this.screening
			.find(query)
			.sort({ startAt: 1 })
			.lean()
			.exec()

		return docs.map(doc => ScreeningMapper.toEntity(doc))
	}

	public async findManyByMovie(
		movieId: string,
		dayStart?: Date,
		dayEnd?: Date
	): Promise<ScreeningEntity[]> {
		const query: Record<string, unknown> = { movieId }
		if (dayStart && dayEnd) {
			query.startAt = { $gte: dayStart, $lt: dayEnd }
		}

		const docs = await this.screening
			.find(query)
			.sort({ startAt: 1 })
			.lean()
			.exec()

		return docs.map(doc => ScreeningMapper.toEntity(doc))
	}
}
