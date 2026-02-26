import { RpcStatus } from '@choncinema/common'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { nanoid } from 'nanoid'

import { ScreeningEntity } from '../../domain/entities/screeening.entity'
import { HallPort } from '../../domain/ports/hall.port'
import { ScreeningRepositoryPort } from '../../domain/ports/screeening.repository.port'

@Injectable()
export class CreateScreeningUseCase {
	public constructor(
		public readonly screeningRepository: ScreeningRepositoryPort,
		public readonly hallPort: HallPort
	) {}

	public async execute(input: {
		movieId: string
		hallId: string
		startAt: string
		endAt: string
	}) {
		const start = new Date(input.startAt)
		const end = new Date(input.endAt)

		if (start < end) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				message: 'Start at must be before end at'
			})
		}

		const hall = await this.hallPort.findById(input.hallId)

		if (!hall) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				message: 'Hall not found'
			})
		}

		const overlap = await this.screeningRepository.findOverlap(
			input.hallId,
			start,
			end
		)

		if (overlap) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				message: 'Screening overlap with existing screening id'
			})
		}

		const screening = new ScreeningEntity(
			nanoid(),
			input.hallId,
			input.movieId,
			start,
			end
		)

		await this.screeningRepository.create(screening)

		return { ok: true }
	}
}
