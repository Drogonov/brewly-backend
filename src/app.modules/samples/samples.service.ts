import { Injectable } from '@nestjs/common';
import {
    CreateSampleRequestDto,
    StatusType,
    IStatusResponse,
    IGetSampleInfoResponse,
    IGetSampleTypesResponse
} from './dto';

@Injectable()
export class SamplesService {
    // async createSampleType(dto: CreateSampleTypeRequestDto): Promise<ISuccessIdResponse> {
    //     return {
    //         id: 666
    //     };
    // }

    // async createSampleItem(dto: CreateSampleItemRequestDto): Promise<ISuccessIdResponse> {
    //     return {
    //         id: 666
    //     };
    // }

    async createSample(
        userId: number,
        currentCompanyId: number,
        dto: CreateSampleRequestDto
    ): Promise<IStatusResponse> {
        return {
            status: StatusType.SUCCESS,
            description: "We have created sample, wait till page will update"
        };
    }

    async getSampleInfo(
        userId: number,
        currentCompanyId: number,
        sampleId: number
    ): Promise<IGetSampleInfoResponse> {
        return {
            sampleTypeInfo: {
                sampleTypeId: 0,
                companyName: 'Tasty Coffee',
                sampleName: 'Irgachiff 4',
                roastType: 1,
                coffeeType: 'Blend',
            },
            coffeePacksInfo: [
                {
                    roastDate: '2025-02-01T00:00:00Z',
                    openDate: '2025-02-07T00:00:00Z',
                    wheight: 250,
                    packIsOver: false
                }, {
                    roastDate: '2025-03-01T00:00:00Z',
                    openDate: '2025-03-07T00:00:00Z',
                    wheight: 1000,
                    packIsOver: false
                }
            ]
        }
    }

    async getSampleTypes(
        userId: number,
        currentCompanyId: number
    ): Promise<IGetSampleTypesResponse> {
        return {
            sampleTypesInfo: [
                {
                    sampleTypeId: 0,
                    companyName: 'Tasty Coffee',
                    sampleName: 'Irgachiff 4',
                    roastType: 1,
                    coffeeType: 'Mono',
                    packsInWarehouseDescription: "2 packs of 250g and 1 pack of 1000g"
                },
                {
                    sampleTypeId: 1,
                    companyName: 'Tasty Coffee',
                    sampleName: 'Brazilia Cerrado',
                    roastType: 3,
                    coffeeType: 'Blend',
                    packsInWarehouseDescription: "1 pack of 1000g"
                }
            ]
        }
    }

    // async createCustomRoastType(dto: CreateRoastTypeRequestDto): Promise<IRoastTypeResponse> {
    //     return {
    //         id: 666,
    //         value: "Medium+"
    //     };
    // }

    // async createCustomCoffeeType(dto: CreateCoffeeTypeRequestDto): Promise<ICoffeeTypeResponse> {
    //     return {
    //         id: 666,
    //         value: "Medium+"
    //     };
    // }

    // async getAvailiableRoastTypes(companyId: number): Promise<IRoastTypeResponse[]> {
    //     return [
    //         {
    //             id: 0,
    //             value: 'Medium+'
    //         },
    //         {
    //             id: 1,
    //             value: "Hard"
    //         }
    //     ];
    // }

    // async getAvailiableCoffeeTypes(companyId: number): Promise<IRoastTypeResponse[]> {
    //     return [
    //         {
    //             id: 0,
    //             value: 'Medium+'
    //         },
    //         {
    //             id: 1,
    //             value: "Hard"
    //         }
    //     ];
    // }

    // async searchForSampleType(str: string): Promise<ISearchSampleTypeResponse[]> {
    //     return [
    //         {
    //             sampleTypeId: 0,
    //             compnayName: 'Tasty Coffee',
    //             sampleName: 'Brazilia Cerrado',
    //             roastType: 'Medium',
    //             coffeeType: 'Natural'
    //         }
    //     ];
    // }

    // async searchForSampleItem(str: string): Promise<ISampleResponse[]> {
    //     return [
    //         {
    //             sampleTypeId: 777,
    //             compnayName: "Tasty Coffee",
    //             sampleName: "Brazilia Cerrado",
    //             roastType: "Medium",
    //             coffeeType: "Blend",
    //             sampleItemId: 666,
    //             roastDate: "01.12.2021",
    //             openDate: "13.12.2021",
    //             wheight: 250,
    //             barCode: "666777",
    //         }
    //     ];
    // }
}