/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common'
import { resolveDayRange } from 'src/shared/utils'

import { Hall, HallPort } from '../../domain/ports/hall.port'
import { ScreeningRepositoryPort } from '../../domain/ports/screeening.repository.port'
import { SeatPort } from '../../domain/ports/seat.port'
import { Theater, TheaterPort } from '../../domain/ports/theater.port'

@Injectable()
export class GetScreeningsByMovieUseCase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly theaterPort: TheaterPort,
		private readonly hallPort: HallPort,
		private readonly seatPort: SeatPort
	) {}

	public async execute(input: { movieId: string; date?: string }) {
		const { date, movieId } = input
		const { start, end } = resolveDayRange(date)

		const screenings = await this.repository.findManyByMovie(
			movieId,
			start,
			end
		)

		if (!screenings.length) return []

		const cachedTheater = new Map<string, Promise<Theater | null>>()
		const cachedHall = new Map<string, Promise<Hall | null>>()

		const enriched = await Promise.all(
			screenings.map(async screening => {
				const hall = await this.getCached(
					screening.hallId,
					'hall',
					cachedHall
				)
				if (!hall) return null

				const theater = await this.getCached(
					hall.theaterId,
					'theater',
					cachedTheater
				)

				if (!theater) return null

				const seatTypes = await this.seatPort.listSeatTypes(
					screening.hallId,
					screening.id
				)

				return {
					id: screening.id,
					startAt: screening.startAt,
					endAt: screening.endAt,
					hall,
					theater,
					seatTypes
				}
			})
		)

		return enriched.filter(Boolean)
	}

	private getCached<T>(
		id: string,
		port: string,
		cache: Map<string, Promise<T | null>>
	): Promise<T | null> {
		const ports = {
			theater: this.theaterPort,
			hall: this.hallPort
		}

		let promise = cache.get(id)

		if (!promise) {
			promise = ports?.[port]?.findById(id)

			cache.set(id, promise!)
		}

		return promise!
	}
}
