import { PROTO_PATHS } from '@choncinema/contracts'
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MongooseModule } from '@nestjs/mongoose'

import { CreateScreeningUseCase } from './application/commants/create-screening.usecase'
import { GetScreeningByIdUseCase } from './application/queries/get-screening.usecase'
import { GetScreeningsByMovieUseCase } from './application/queries/get-screenings-by-movie.usecase'
import { GetScreeningsUseCase } from './application/queries/get-screenings.usecase'
import { HallPort } from './domain/ports/hall.port'
import { MoviePort } from './domain/ports/movie.port'
import { ScreeningRepositoryPort } from './domain/ports/screeening.repository.port'
import { SeatPort } from './domain/ports/seat.port'
import { TheaterPort } from './domain/ports/theater.port'
import { ScreeningMongoRepository } from './infrastructure/database/repositories/screening.mongo.repository'
import {
	ScreeningModel,
	ScreeningSchema
} from './infrastructure/database/schemas/screening.schema'
import { HallGrpcAdapter } from './infrastructure/grpc/hall.grpc.adapter'
import { MovieGrpcAdapter } from './infrastructure/grpc/movie.grpc.adapter'
import { SeatGrpcAdapter } from './infrastructure/grpc/seat.grpc.adapter'
import { TheaterGrpcAdapter } from './infrastructure/grpc/theater.grpc.adapter'
import { ScreeningGrpcController } from './interfaces/grpc/screening.grpc.controller'

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: ScreeningModel.name,
				schema: ScreeningSchema
			}
		]),
		ClientsModule.registerAsync([
			{
				name: 'THEATER_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'theater.v1',
						protoPath: PROTO_PATHS.THEATER,
						url: configService.getOrThrow<string>(
							'THEATER_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'MOVIE_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'movie.v1',
						protoPath: PROTO_PATHS.MOVIE,
						url: configService.getOrThrow<string>('MOVIE_GRPC_URL')
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'HALL_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'hall.v1',
						protoPath: PROTO_PATHS.HALL,
						url: configService.getOrThrow<string>(
							'THEATER_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			},
			{
				name: 'SEAT_PACKAGE',
				useFactory: (configService: ConfigService) => ({
					transport: Transport.GRPC,
					options: {
						package: 'seat.v1',
						protoPath: PROTO_PATHS.SEAT,
						url: configService.getOrThrow<string>(
							'THEATER_GRPC_URL'
						)
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	controllers: [ScreeningGrpcController],
	providers: [
		{
			provide: ScreeningRepositoryPort,
			useClass: ScreeningMongoRepository
		},
		{
			provide: TheaterPort,
			useClass: TheaterGrpcAdapter
		},
		{
			provide: MoviePort,
			useClass: MovieGrpcAdapter
		},
		{
			provide: HallPort,
			useClass: HallGrpcAdapter
		},
		{
			provide: SeatPort,
			useClass: SeatGrpcAdapter
		},
		CreateScreeningUseCase,
		GetScreeningByIdUseCase,
		GetScreeningsByMovieUseCase,
		GetScreeningsUseCase
	]
})
export class ScreeningModule {}
