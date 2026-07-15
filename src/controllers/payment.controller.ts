import * as paymentService from "../services/index.js";
import { ErrorHandler, TryCatch } from "../utils/index.js";

export const createPayment = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const payment = await paymentService.createPayment(userId, req.body.orderId);

  return res.status(201).json(payment);
});

export const verifyPayment = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const payment = await paymentService.verifyPayment(userId, req.body);

  return res.json(payment);
});

export const getPaymentById = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const paymentId = req.params.paymentId as string;

  const payment = await paymentService.getPaymentById(userId, paymentId);

  return res.json(payment);
});

export const getPaymentByOrderId = TryCatch(async (req, res) => {
  const { userId } = req.user!;

  const orderId = req.params.orderId as string;

  const payment = await paymentService.getPaymentByOrderId(userId, orderId);

  return res.json(payment);
});

export const webhook = TryCatch(async (req, res) => {
  const rawBody = req.body as Buffer;

  if (!rawBody || rawBody.length === 0) {
    throw new ErrorHandler(400, "Webhook body is required.");
  }

  const signature = req.headers["x-razorpay-signature"] as string;
  const bodyString = rawBody.toString();

  await paymentService.handleWebhook(
    bodyString,
    signature,
    JSON.parse(bodyString),
  );

  return res.status(200).json({
    success: true,
  });
});
