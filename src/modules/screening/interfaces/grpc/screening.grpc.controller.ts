/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type {
	CreateScreeningRequest,
	CreateScreeningResponse,
	GetScreeningRequest,
	GetScreeningsByMovieRequest,
	GetScreeningsRequest
} from '@choncinema/contracts/gen/ts/screening'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { CreateScreeningUseCase } from '../../application/commants/create-screening.usecase'
import { GetScreeningByIdUseCase } from '../../application/queries/get-screening.usecase'
import { GetScreeningsByMovieUseCase } from '../../application/queries/get-screenings-by-movie.usecase'
import { GetScreeningsUseCase } from '../../application/queries/get-screenings.usecase'

@Controller()
export class ScreeningGrpcController {
	public constructor(
		private readonly listUC: GetScreeningsUseCase,
		private readonly getUC: GetScreeningByIdUseCase,
		private readonly createUC: CreateScreeningUseCase,
		private readonly getByMovieUC: GetScreeningsByMovieUseCase
	) {}

	@GrpcMethod('ScreeningService', 'GetScreening')
	public async getScreeningById(data: GetScreeningRequest) {
		const screening = await this.getUC.execute(data.screeningId)

		return {
			screening
		}
	}

	@GrpcMethod('ScreeningService', 'CreateScreening')
	public async createScreening(
		data: CreateScreeningRequest
	): Promise<CreateScreeningResponse> {
		return await this.createUC.execute(data)
	}

	@GrpcMethod('ScreeningService', 'GetScreenings')
	public async getAll(data: GetScreeningsRequest) {
		const screenings = await this.listUC.execute(data)

		return {
			screenings
		}
	}

	@GrpcMethod('ScreeningService', 'GetScreeningsByMovie')
	public async getByMovie(data: GetScreeningsByMovieRequest) {
		const screenings = await this.getByMovieUC.execute(data)

		return {
			screenings
		}
	}
}
