import { Injectable } from '@nestjs/common';
import { IOnboardingResponse } from './dto';

@Injectable()
export class OnboardingService {

    async getOnboarding(pageNumber?: number): Promise<IOnboardingResponse> {
        return {
            pages: [
                {
                    title: "Onboarding 1",
                    text: "Lorem Ipsum",
                    imageURL: new URL("https://picsum.photos/seed/picsum/200/300"),
                    buttonText: "Lets Go"
                }
            ]
        }
    }
}