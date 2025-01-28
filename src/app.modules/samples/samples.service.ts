import { Injectable } from '@nestjs/common';
import {
    CreateSampleTypeRequestDto,
    CreateSampleItemRequestDto,
    CreateSampleRequestDto,
    CreateRoastTypeRequestDto,
    IRoastTypeResponse,
    ISampleResponse,
    ISuccessIdResponse,
    CreateCoffeeTypeRequestDto,
    ICoffeeTypeResponse,
    ISearchSampleTypeResponse
} from './dto';

@Injectable()
export class SamplesService {
    async createSampleType(dto: CreateSampleTypeRequestDto): Promise<ISuccessIdResponse> {
        return {
            id: 666
        };
    }

    async createSampleItem(dto: CreateSampleItemRequestDto): Promise<ISuccessIdResponse> {
        return {
            id: 666
        };
    }

    async createSample(dto: CreateSampleRequestDto): Promise<ISampleResponse> {
        return {
            sampleTypeId: 777,
            compnayName: "Tasty Coffee",
            sampleName: "Brazilia Cerrado",
            roastType: "Medium",
            coffeeType: "Blend",
            sampleItemId: 666,
            roastDate: "01.12.2021",
            openDate: "13.12.2021",
            wheight: 250,
            barCode: "666777",
        };
    }

    async createCustomRoastType(dto: CreateRoastTypeRequestDto): Promise<IRoastTypeResponse> {
        return {
            id: 666,
            value: "Medium+"
        };
    }

    async createCustomCoffeeType(dto: CreateCoffeeTypeRequestDto): Promise<ICoffeeTypeResponse> {
        return {
            id: 666,
            value: "Medium+"
        };
    }

    async getAvailiableRoastTypes(companyId: number): Promise<IRoastTypeResponse[]> {
        return [
            {
                id: 0,
                value: 'Medium+'
            },
            {
                id: 1,
                value: "Hard"
            }
        ];
    }

    async getAvailiableCoffeeTypes(companyId: number): Promise<IRoastTypeResponse[]> {
        return [
            {
                id: 0,
                value: 'Medium+'
            },
            {
                id: 1,
                value: "Hard"
            }
        ];
    }

    async searchForSampleType(str: string): Promise<ISearchSampleTypeResponse[]> {
        return [
            {
                sampleTypeId: 0,
                compnayName: 'Tasty Coffee',
                sampleName: 'Brazilia Cerrado',
                roastType: 'Medium',
                coffeeType: 'Natural'
            }
        ];
    }

    async searchForSampleItem(str: string): Promise<ISampleResponse[]> {
        return [
            {
                sampleTypeId: 777,
                compnayName: "Tasty Coffee",
                sampleName: "Brazilia Cerrado",
                roastType: "Medium",
                coffeeType: "Blend",
                sampleItemId: 666,
                roastDate: "01.12.2021",
                openDate: "13.12.2021",
                wheight: 250,
                barCode: "666777",
            }
        ];
    }
}