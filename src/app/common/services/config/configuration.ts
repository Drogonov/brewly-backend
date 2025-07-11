export const configuration = () => ({
    env: process.env.NODE_ENV,
    db: {
        url: process.env.DATABASE_URL,
    },
    app: {
        port: process.env.APP_PORT,
        emailAPI: process.env.BREVO_API_KEY,
    },
    jwt: {
        at: process.env.AT_SECRET,
        rt: process.env.RT_SECRET,
    },
    otp: {
        dev: process.env.OTP_DEV || "666666",
    },
    assets: {
        appStoreURL: process.env.APP_STORE_URL,
        telegramGroupURL: process.env.TELEGRAM_URL,
        privacyPolicyURL: process.env.PRIVACY_POLICY_URL
    }
});