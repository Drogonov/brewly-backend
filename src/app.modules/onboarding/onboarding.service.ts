import { Injectable } from '@nestjs/common';
import { IOnboardingResponse } from './dto';

@Injectable()
export class OnboardingService {

    async getOnboarding(): Promise<IOnboardingResponse> {
        return {
            pages: [
                {
                    title: "Onboarding 1",
                    text: "Lorem Ipsum",
                    imageURL: "https://picsum.photos/seed/picsum/200/300",
                    buttonText: "Lets Go"
                }
            ]
        }
    }
}