import * as Brevo from '@getbrevo/brevo';

export const mailProviders = [
  {
    provide: ,
    useFactory: Brevo.TransactionalEmailsApi => {
      const client = new Brevo.TransactionalEmailsApi();
      client.setApiKey(
        Brevo.TransactionalEmailsApiApiKeys.apiKey,
        config.get<string>('EMAIL_API_KEY'),
      );
      return client;
    },
    inject: [ConfigService],
  },
];