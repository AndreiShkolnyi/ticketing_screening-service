import { TheaterServiceClient } from '@choncinema/contracts/gen/ts/theater'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import type { ClientGrpc } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

import { Theater, TheaterPort } from '../../domain/ports/theater.port'

@Injectable()
export class TheaterGrpcAdapter implements TheaterPort, OnModuleInit {
	private service: TheaterServiceClient

	public constructor(
		@Inject('THEATER_PACKAGE')
		private readonly client: ClientGrpc
	) {}

	public onModuleInit() {
		this.service =
			this.client.getService<TheaterServiceClient>('TheaterService')
	}

	public async findById(id: string): Promise<Theater | null> {
		const res = await lastValueFrom(this.service.getTheater({ id }))

		return res.theater ?? null
	}
}
