import { ScreeningEntity } from '../entities/screeening.entity'

export abstract class ScreeningRepositoryPort {
	public abstract findById(
		screeningId: string
	): Promise<ScreeningEntity | null>
	public abstract findManyByMovie(
		movieId: string,
		dayStart?: Date,
		dayEnd?: Date
	): Promise<ScreeningEntity[]>
	public abstract findByDateRange(
		dayStart: Date,
		dayEnd: Date,
		hallIds?: string[]
	): Promise<ScreeningEntity[]>
	public abstract findOverlap(
		hallId: string,
		startAt: Date,
		endAt: Date
	): Promise<ScreeningEntity | null>
	public abstract create(screening: ScreeningEntity): Promise<ScreeningEntity>
}
