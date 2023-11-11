import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './entity';
import { Repository } from 'typeorm';

@Injectable()
export class BudgetsService {
	constructor(
		@InjectRepository(Budget)
		private readonly budgetsRepository: Repository<Budget>, //
	) {}
}
