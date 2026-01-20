import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const billingPortal = async (req, res) => {
  const { customerId } = req.params;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `http://localhost:3000`,
    });
    console.log("🚀 ~ billingPortal ~ session:", session);

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const createProduct = async (req, res) => {
  const { name, description, price, currency = "usd" } = req.body;
  try {
    const product = await stripe.products.create({
      name,
      description,
      default_price_data: {
        currency,
        unit_amount: price,
      },
    });
    console.log("🚀 ~ createProduct ~ product:", product);

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const paymentLink = async (req, res) => {
  const { productId, quantity, price, currency = "usd" } = req.body;
  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          quantity,
          price_data: {
            product: productId,
            currency,
            unit_amount: price,
          },
        },
      ],
    });
    console.log("🚀 ~ createProduct ~ product:", paymentLink);

    return res.status(200).json(paymentLink);
  } catch (error) {
    return res.status(500).json(error);
  }
};
