import { ConfigService } from '@nestjs/config'
import { MongooseModuleOptions } from '@nestjs/mongoose'

export function getMongooseConfig(
	config: ConfigService
): MongooseModuleOptions {
	return {
		uri: config.getOrThrow('MONGO_URI'),
		serverSelectionTimeoutMS: 5000
	}
}
