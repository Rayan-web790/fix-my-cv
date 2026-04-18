const axios = require('axios');

const getPayPalAccessToken = async () => {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post('https://api-m.sandbox.paypal.com/v1/oauth2/token', 
        'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    return response.data.access_token;
};

const createProduct = async (token) => {
    try {
        const response = await axios.post('https://api-m.sandbox.paypal.com/v1/catalogs/products', {
            name: "FixMyCV Premium",
            description: "Monthly subscription for premium AI CV optimization features.",
            type: "SERVICE",
            category: "SOFTWARE"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': `product-${Date.now()}`
            }
        });
        return response.data.id;
    } catch (err) {
        console.error("PayPal Product Creation Error:", err.response?.data || err.message);
        throw err;
    }
};

const createPlan = async (token, productId) => {
    try {
        const response = await axios.post('https://api-m.sandbox.paypal.com/v1/billing/plans', {
            product_id: productId,
            name: "FixMyCV Premium Monthly",
            description: "$5/month for Premium access",
            status: "ACTIVE",
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: "MONTH",
                        interval_count: 1
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: {
                        fixed_price: {
                            value: "5",
                            currency_code: "USD"
                        }
                    }
                }
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: "0",
                    currency_code: "USD"
                },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'PayPal-Request-Id': `plan-${Date.now()}`
            }
        });
        return response.data.id;
    } catch (err) {
        console.error("PayPal Plan Creation Error:", err.response?.data || err.message);
        throw err;
    }
};

const verifySubscription = async (subscriptionId) => {
    const token = await getPayPalAccessToken();
    try {
        const response = await axios.get(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        console.error("PayPal Subscription Verification Error:", err.response?.data || err.message);
        throw err;
    }
};

module.exports = {
    getPayPalAccessToken,
    createProduct,
    createPlan,
    verifySubscription
};
