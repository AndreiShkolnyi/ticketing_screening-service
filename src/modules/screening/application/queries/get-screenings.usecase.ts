/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common'
import { resolveDayRange } from 'src/shared/utils'

import { Hall, HallPort } from '../../domain/ports/hall.port'
import { Movie, MoviePort } from '../../domain/ports/movie.port'
import { ScreeningRepositoryPort } from '../../domain/ports/screeening.repository.port'
import { SeatPort } from '../../domain/ports/seat.port'
import { Theater, TheaterPort } from '../../domain/ports/theater.port'

@Injectable()
export class GetScreeningsUseCase {
	public constructor(
		private readonly repository: ScreeningRepositoryPort,
		private readonly theaterPort: TheaterPort,
		private readonly hallPort: HallPort,
		private readonly seatPort: SeatPort,
		private readonly moviePort: MoviePort
	) {}

	public async execute(input: { date?: string; theaterId?: string }) {
		const { date, theaterId } = input
		const { start, end } = resolveDayRange(date)

		let hallIds: string[] | undefined

		if (theaterId) {
			const halls = await this.hallPort.listByTheater(theaterId)

			if (!halls.length) {
				return []
			}

			hallIds = halls.map(hall => hall.id)
		}

		const screenings = await this.repository.findByDateRange(
			start,
			end,
			hallIds
		)

		if (!screenings.length) return []

		const cachedTheater = new Map<string, Promise<Theater | null>>()
		const cachedHall = new Map<string, Promise<Hall | null>>()
		const cachedMovie = new Map<string, Promise<Movie | null>>()

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

				const movie = await this.getCached(
					screening.movieId,
					'movie',
					cachedMovie
				)

				if (!movie) return null

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
					movie,
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
			hall: this.hallPort,
			movie: this.moviePort
		}

		let promise = cache.get(id)

		if (!promise) {
			promise = ports?.[port]?.findById(id)

			cache.set(id, promise!)
		}

		return promise!
	}
}
