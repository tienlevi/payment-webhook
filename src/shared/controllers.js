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
        //Event when the subscription started
        case "checkout.session.completed":
          console.log("New Subscription started!");
          console.log(event.data);
          break;

        // Event when the payment is successfull (every subscription interval)
        case "invoice.paid":
          console.log("Invoice paid");
          console.log(event.data);
          break;

        // Event when the payment failed due to card problems or insufficient funds (every subscription interval)
        case "invoice.payment_failed":
          console.log("Invoice payment failed!");
          console.log(event.data);
          break;

        // Event when subscription is updated
        case "customer.subscription.updated":
          console.log("Subscription updated!");
          console.log(event.data);
          break;

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
