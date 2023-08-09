import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";
import { Customer } from "../models/customer";
import type { Arc, Core } from './types'
import { CompleterResult } from "readline";

// class CardTokenResponse {
//   token: string;
// }

// /** External request data */

// type ExternalPaymentMethod = 'pix' | 'bank_slip' | 'credit_card';

// /** return data */

// export class PaymentBankSlipResourceView {
//   barcode: string;
//   link: string;
//   expireAt: string;
// }

// export class CurrentGatewayView {
//   gateway: string;
//   referenceIn: string;
// }

// type PaymentStateView = {
//   status: PaymentStatusView;
//   bankSlipResource: PaymentBankSlipResourceView | null;
//   creditCardResource: Record<string, unknown> | null;
//   pixResource: PaymentPixView | null;
//   details: {
//     readonly currentGateway: CurrentGatewayView | null;
//   };
//   paidAt: string | null;
// }



// export class PaymentDebtsInstallment {
//   fee: number;
//   numberOfInstallments: number;
//   coupon: string; // ???
//   type: string; // ???
//   priceInCents: number;
//   monthlyFee: number;
//   priceWithInterestInCents: number;
// }

// export class PaymentDebtsItem {
//   protocol: string;
//   externalId: string;
//   title: string;
//   description: string;
//   amountInCents: number;
//   dueDate: string;
//   required: boolean;
//   distinct: ReadonlyArray<string>;
//   dependsOn: ReadonlyArray<string>;
// }

// export class PaymentDebts {
//   installment: PaymentDebtsInstallment;
//   items: ReadonlyArray<PaymentDebtsItem>;
// }

// export class PaymentItem {
//   name: string;
//   totalValueInCents: number;
//   unitValueInCents: number;
//   amount: number;
//   queryId: string;
//   packageId: string;
//   signatureId: string;
// }

// export class PaymentCreditCard {
//   token: string;
//   installments: number;
//   installmentValueInCents: number;
// }

// export class GatewayHistoryArcDetail {
//   referenceIn: string;
//   createdAt: string;
// }

// export class GatewayArcDetails {
//   gatewayHistory: Record<string, GatewayHistoryArcDetail>;
// }

// export class GatewayDetails {
//   arc?: GatewayArcDetails | null;
// }

// export enum PaymentType {
//   BANKING_BILLET = 'banking_billet',
//   CREDIT_CARD = 'credit_card',
//   PIX = 'pix',
// }

// enum PaymentStatus {
//   PAID = 'paid',
//   UNPAID = 'unpaid',
//   PENDING = 'pending',
// }





// type RequestPaymentResponse = {
//   id: string;
// };

export class ArcHttpClient {
  private static readonly APPLICATION_ID: string = `4d680247-a005-52d5-94ca-aacc59233849`;
  private static readonly ARC_TOKEN: string = `fbc2d6a2-cc04-40f4-b060-acd597a3d68f`;
  private static readonly BASE_URL: string = `https://xbub67gq59.execute-api.sa-east-1.amazonaws.com/homolog`;
  private static readonly CNPJ: string = `50656367000136`;

  constructor() { }

  async getCustomer(params: Core.Req.GetCustomer): Promise<Core.Res.FetchedCustomer> {
    type Response = AxiosResponse<Arc.Out.Resp<Arc.Out.Customer>>;

    const url: string = `${ArcHttpClient.BASE_URL}/api/customer/by_tenant_ref/${params.customerId}`;
    const response: Response = await axios.get(url, { auth: this._getCredentials() });
    return response.data.data;
  }

  async createCustomer(customer: Core.Req.CreateCustomer, opts?: Core.Req.CreateCustomerOpts): Promise<Core.Res.CreatedCustomer> {
    const url: string = ArcHttpClient.BASE_URL + '/api/customer';
    const body: Arc.In.CreateCustomer = {
      ...this._createCustomerBody(customer),
      tenant_ref: customer.id,
      ensure: opts.ensurePossibleToCreatePayment ?? false,
    };
    const response: AxiosResponse<Arc.Out.Resp<Arc.Out.Customer>> = await axios.post(url, body, {
      headers: ArcHttpClient._createTelemetryHeaders({ userId: customer.id }),
      auth: this._getCredentials(),
    });

    return response.data.data;
  }

  async createCustomerIfNotExists(customer: Core.Req.CreateCustomer, opts?: Core.Req.CreateCustomerOpts): Promise<Core.Res.CreatedCustomer> {
    try {
      const arcCustomer: Core.Res.FetchedCustomer = await this.getCustomer({ customerId: customer.id });
      if (typeof arcCustomer !== 'object' || arcCustomer === null) throw new Error();
      return arcCustomer;
    } catch (_error) {
      const arcCustomer: Core.Res.CreatedCustomer = await this.createCustomer(customer, opts);
      if (typeof arcCustomer !== 'object' || arcCustomer === null) throw new Error(`Can't create customer at Arc`);
      return arcCustomer;
    }
  }

  async fetchPayment(
    params: Core.Req.FetchPayment,
    telemetryOptions: Core.Req.TelemetryOptions = {},
  ): Promise<Core.Res.FetchedPayment> {
    const url: string = ArcHttpClient.BASE_URL + `/api/payment/${params.externalPaymentId}`;
    const response: AxiosResponse<Arc.Out.Resp<Arc.Out.Payment>> = await axios.get(url, {
      headers: ArcHttpClient._createTelemetryHeaders(telemetryOptions),
      auth: this._getCredentials(),
    });
    const data = response.data.data

    return {
      status: ArcHttpClient._mapExternalStatusToInternalStatus(data.status),
      bankSlipResource: ArcHttpClient._mapExternalBankSlipResourceToInternal(data.bank_slip_resource),
      creditCardResource: null,
      pixResource: ArcHttpClient._mapExternalPixResourceToInternal(data.pix_resource),
      details: {
        currentGateway: data.current_gateway && {
          gateway: data.current_gateway?.gateway?.toUpperCase() ?? null,
          referenceIn: data.current_gateway?.gateway_ref ?? null,
        },
      },
      paidAt: data.paid_at,
    };
  }

  async paymentWithBankSlip(userId: string, payment: PaymentView): Promise<RequestPaymentResponse> {
    const body: RequestPaymentDto = this._createPaymentBody(payment, userId);
    return this._requestPayment(
      body as unknown as Record<string, unknown>,
      ArcHttpClient._createTelemetryHeaders({ paymentId: payment.id, userId }),
    );
  }

  async paymentWithCreditCard(
    userId: string,
    payment: PaymentView,
    cardToken: { token: string },
  ): Promise<RequestPaymentResponse> {
    const body: ViewWithCardToken<RequestPaymentDto> = {
      ...this._createPaymentBody(payment, userId),
      credit_card_token: cardToken.token,
    };
    return this._requestPayment(
      body as unknown as Record<string, unknown>,
      ArcHttpClient._createTelemetryHeaders({ paymentId: payment.id, userId }),
    );
  }

  async paymentWithPix(userId: string, payment: PaymentView): Promise<RequestPaymentResponse> {
    const body: RequestPaymentDto = this._createPaymentBody(payment, userId);
    return this._requestPayment(
      body as unknown as Record<string, unknown>,
      ArcHttpClient._createTelemetryHeaders({ paymentId: payment.id, userId }),
    );
  }

  /** Private functions */

  private _getCredentials(): In.BasicCredentials {
    return {
      username: `${ArcHttpClient.APPLICATION_ID}@${ArcHttpClient.CNPJ}`,
      password: ArcHttpClient.ARC_TOKEN,
    };
  }

  private static _createTelemetryHeaders(params: TelemetryHeadersParam): AxiosRequestHeaders {
    const headers: AxiosRequestHeaders = {} as AxiosRequestHeaders;

    // eslint-disable-next-line functional/immutable-data
    if (params.userId) headers['x-customer-ref'] = params.userId;
    // eslint-disable-next-line functional/immutable-data
    if (params.paymentId) headers['x-payment-ref'] = params.paymentId;

    return headers;
  }

  private _createCustomerBody(
    customer: Customer
  ): Omit<Arc.In.CreateCustomer, 'tenant_ref'> {
    return {
      document: customer.document,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone,
      email: customer.email,
      street: ArcHttpClient._limitString(customer.billing_address.address_1),
      number: ArcHttpClient._limitString(customer.billing_address.address_2),
      neighborhood: 'Não informado',
      city: ArcHttpClient._limitString(customer.billing_address.city, 50, 'São Paulo'),
      state: ArcHttpClient._limitString(customer.billing_address.province, 2, 'SP'),
      zipcode: ArcHttpClient._limitString(customer.billing_address.postal_code, 8, '01153000'),
      complement: 'Não informado',
    };
  }

  private _createPaymentBody(payment: PaymentView, userId: string): RequestPaymentDto {
    return {
      ...this._createPaymentPartBody(payment),
      ...ArcHttpClient._createCustomerPartBody(userId),
      strategy_id: null,
    };
  }

  private _createPaymentPartBody(payment: PaymentView): IPaymentInfoPart {
    return {
      total_value_in_cents: payment.realPriceInCents,
      amount_to_discount_in_cents: this._getDiscountedValueInCents(
        payment.realPriceInCents,
        payment.totalPriceWithDiscountInCents,
      ),
      number_of_installments: payment?.creditCard?.installments ?? 1,
      method: ArcHttpClient._mapPaymentType(payment.type),
      idempotence: payment.id,
    };
  }

  private static _createCustomerPartBody(userId: string): ICustomerInfoPart {
    return {
      tenant_ref: userId,
    };
  }

  private async _requestPayment(
    body: Record<string, unknown>,
    telemetryHeaders: AxiosRequestHeaders,
  ): Promise<RequestPaymentResponse> {
    const url: string = ArcHttpClient.BASE_URL + '/api/payment';
    const response: AxiosResponse<ArcResponse<RequestPaymentResponse>> = await axios.post(url, body, {
      headers: telemetryHeaders,
      auth: this._getCredentials(),
    });
    return this._parsePaymentResponse(response.data);
  }

  private _parsePaymentResponse(response: ArcResponse<RequestPaymentResponse>): RequestPaymentResponse {
    if (!response?.data) throw new Error('')
    return response.data;
  }

  private static _mapPaymentType(type: PaymentType): ExternalPaymentMethod {
    switch (type as PaymentType) {
      case PaymentType.BANKING_BILLET:
        return 'bank_slip';

      case PaymentType.CREDIT_CARD:
        return 'credit_card';

      case PaymentType.PIX:
        return 'pix';

      default:
        throw new Error('Unknown');
    }
  }

  private _getDiscountedValueInCents(totalValue: number, valueWithDiscount: number): number {
    return totalValue - valueWithDiscount // oh no

    // return this._currencyUtil
    //   .numToCurrency(totalValue, Currency.CENTS_PRECISION)
    //   .minusValue(valueWithDiscount, Currency.CENTS_PRECISION)
    //   .toInt();
  }

  private static _mapExternalStatusToInternalStatus(status: PaymentStatus): PaymentStatusView {
    switch (status) {
      case PaymentStatus.CANCELLED:
        return PaymentStatusView.UNPAID;

      case PaymentStatus.CANCELLING:
        return PaymentStatusView.PENDING;

      case PaymentStatus.PAID:
        return PaymentStatusView.PAID;

      case PaymentStatus.PENDING:
        return PaymentStatusView.PENDING;

      case PaymentStatus.REFUNDED:
        return PaymentStatusView.UNPAID;

      case PaymentStatus.REFUNDING:
        return PaymentStatusView.PENDING;

      case PaymentStatus.UNPAID:
        return PaymentStatusView.UNPAID;
    }
  }

  private static _mapExternalBankSlipResourceToInternal(
    bankSlipResource?: Arc.In.ArcBankSlipResource,
  ): PaymentBankSlipResourceView | null {
    return bankSlipResource
      ? {
        barcode: bankSlipResource.barcode,
        link: bankSlipResource.barcode_link,
        expireAt: null,
      }
      : null;
  }

  private static _mapExternalPixResourceToInternal(pixResource?: Arc.In.ArcPixResource): PaymentPixView | null {
    return pixResource
      ? {
        qrcode: pixResource.qr_code_image,
        qrcodeText: pixResource.qr_code,
      }
      : null;
  }

  private static _limitString(word: string, maxChars: number = 30, defaults: string = 'Não informado'): string {
    return typeof word === 'string' ? word.substring(0, maxChars) : defaults;
  }
}