import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = 'https://app.posthog.com';

export const initAnalytics = () => {
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            autocapture: true, // Captures clicks, pageviews automatically
            capture_pageview: true,
            persistence: 'localStorage',
        });
    }
};

export const trackEvent = (eventName, properties = {}) => {
    if (POSTHOG_KEY) {
        posthog.capture(eventName, properties);
    } else {
        console.log(`[Analytics Simulation]: ${eventName}`, properties);
    }
};

export const identifyUser = (uid, email) => {
    if (POSTHOG_KEY) {
        posthog.identify(uid, { email });
    }
};

export const resetAnalytics = () => {
    if (POSTHOG_KEY) {
        posthog.reset();
    }
};
