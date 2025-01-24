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
                    imageUrl: new URL("https://brewly.digital/images/1"),
                    buttonText: "Lets Go"
                }
            ]
        }
    }
}