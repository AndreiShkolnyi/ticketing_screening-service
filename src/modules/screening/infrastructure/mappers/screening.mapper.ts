/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ScreeningEntity } from '../../domain/entities/screeening.entity'

export class ScreeningMapper {
	public static toEntity(raw: any): ScreeningEntity {
		return new ScreeningEntity(
			raw._id.toString(),
			raw.hallId,
			raw.movieId,
			raw.startAt,
			raw.endAt
		)
	}

	public static toPersistence(entity: ScreeningEntity) {
		return {
			_id: entity.id,
			hallId: entity.hallId,
			movieId: entity.movieId,
			startAt: entity.startAt,
			endAt: entity.endAt
		}
	}
}
