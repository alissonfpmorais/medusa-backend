import {
  AbstractPaymentProcessor,
  PaymentProcessorContext,
  PaymentProcessorError,
  PaymentProcessorSessionResponse,
  PaymentSessionStatus,
} from "@medusajs/medusa"
import { ArcHttpClient } from "../core/arc-http-client";

export default class ArcPaymentProcessor extends AbstractPaymentProcessor {
  static identifier = "arc-payment"
  private readonly _arcHttpClient: ArcHttpClient;

  constructor(container, _options) {
    super(container)
    this._arcHttpClient = new ArcHttpClient()
  }

  async initiatePayment(
    context: PaymentProcessorContext
  ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse
  > {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    PaymentProcessorError |
    {
      status: PaymentSessionStatus;
      data: Record<string, unknown>;
    }
  > {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async updatePayment(
    context: PaymentProcessorContext
  ): Promise<
    void |
    PaymentProcessorError |
    PaymentProcessorSessionResponse
  > {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }

  async updatePaymentData(
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    throw new Error('Not implemented yet');
    // return this._arcHttpClient;
  }
}