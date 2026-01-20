import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

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

export const webhook = async (req, res) => {
  try {
    let event;
    if (endpointSecret) {
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          endpointSecret,
        );
      } catch (err) {
        return res
          .status(400)
          .json({ message: "⚠️ Webhook signature verification failed.", err });
      }

      // Handle the event
      switch (event.type) {
        case "payment_link.created": {
          const paymentLink = event.data.object;
          console.log("Payment link created:", paymentLink.id);
          console.log("URL:", paymentLink.url);
          // Store payment link info in your database if needed
          break;
        }
        case "payment_link.updated": {
          const paymentLink = event.data.object;
          console.log("Payment link updated:", paymentLink.id);
          console.log("Active:", paymentLink.active);
          // Update payment link info in your database if needed
          break;
        }
        case "checkout.session.completed": {
          const session = event.data.object;
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription,
          );
          console.log("🚀 ~ webhook ~ subscription:", subscription);
          // Fulfill the purchase - grant access, send confirmation email, etc.
          break;
        }
        case "checkout.session.expired": {
          const session = event.data.object;
          console.log("Checkout session expired:", session.id);
          // Handle expired checkout - notify user, clean up pending order, etc.
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      return res.status(200).json({ received: true });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};
