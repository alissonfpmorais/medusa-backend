import { Customer } from "../models/customer";

export namespace Arc {
  export namespace In {
    export type TelemetryHeaders = {
      readonly userId?: string;
      readonly paymentId?: string;
    }

    export type BasicCredentials = {
      readonly username: string;
      readonly password: string;
    };

    export type CreateCustomer = {
      readonly tenant_ref: string;
      readonly document: string;
      readonly first_name: string;
      readonly last_name: string;
      readonly phone: string;
      readonly email: string;
      readonly street: string;
      readonly number: string;
      readonly neighborhood: string;
      readonly city: string;
      readonly state: string;
      readonly zipcode: string;
      readonly complement: string;
      readonly ensure?: boolean;
    }
  }

  export namespace Out {
    type Meta = {
      timestamp: string;
    }

    export type Resp<Data> = {
      __meta__: Meta;
      data: Data;
    }

    export type Customer = {
      id: string;
      tenant_ref: string;
      document_type: string;
      document: string;
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
      complement: string;
      tenant_id: string;
    };

    export type Payment = {
      id: string;
      paid_at: string | null;
      bank_slip_resource: ArcBankSlipResource | null;
      credit_card_resource: ArcCreditCardResource | null;
      pix_resource: ArcPixResource | null;
      status: PaymentStatus;
      current_gateway: ArcCurrentGateway | null;
    }

    export class PaymentBankingBillet {
      barcode: string;
      link: string;
      expireAt: string;
    }

    export class PaymentPix {
      qrcode: string;
      qrcodeText: string;
    }

    enum PaymentStatusView {
      PENDING = 'pending',
      PAID = 'paid',
      UNPAID = 'unpaid',
      CANCELLING = 'cancelling',
      CANCELLED = 'cancelled',
      REFUNDING = 'refunding',
      REFUNDED = 'refunded',
    }

    interface IExtraPart {
      readonly strategy_id: string | null;
    }

    interface IPaymentInfoPart {
      readonly total_value_in_cents: number;
      readonly amount_to_discount_in_cents: number;
      readonly number_of_installments: number;
      readonly method: ExternalPaymentMethod;
      readonly idempotence: string;
    }

    interface ICustomerInfoPart {
      readonly tenant_ref: string;
    }

    type RequestPaymentDto = IPaymentInfoPart & ICustomerInfoPart & IExtraPart;
  }
}

export namespace Core {
  export namespace Req {
    type Payment = {
      id: string;
      createdAt?: string;
      billingId: string;
      debts?: PaymentDebts;
      items: ReadonlyArray<PaymentItem>;
      chargeId?: string;
      paymentExternalRef: string;
      gatewayDetails: GatewayDetails;
      status: PaymentStatus;
      totalPriceWithDiscountInCents: number;
      totalPriceInCents?: number;
      totalPaidInCents: number;
      realPriceInCents: number;
      paid: boolean;
      type: PaymentType;
      cnpj: string;
      paymentDate?: string;
      creditCard?: PaymentCreditCard;
      bankingBillet?: PaymentBankingBillet;
      pix?: PaymentPix;
      couponId?: string;
      nfeId?: string;
      gateway: PaymentGatewayType;
      refMonth: number;
      refYear: number;
    }

    export type FetchedPayment = Payment;

    export type TelemetryOptions = {
      readonly userId?: string;
      readonly paymentId?: string;
    }

    export type GetCustomer = { customerId: string }

    export type CreateCustomer = Customer

    export type CreateCustomerOpts = {
      ensurePossibleToCreatePayment: boolean;
    };
  }

  export namespace Res {
    type Customer = {
      id: string;
      tenant_ref: string;
      document_type: string;
      document: string;
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      state: string;
      zipcode: string;
      complement: string;
      tenant_id: string;
    };

    export type CreatedCustomer = Customer;

    export type FetchedCustomer = Customer;
  }

  // export type Customer = {
  //   id: string;
  //   tenant_ref: string;
  //   document_type: string;
  //   document: string;
  //   first_name: string;
  //   last_name: string;
  //   phone: string;
  //   email: string;
  //   street: string;
  //   number: string;
  //   neighborhood: string;
  //   city: string;
  //   state: string;
  //   zipcode: string;
  //   complement: string;
  //   tenant_id: string;
  // };

  // export enum PaymentGatewayType {
  //   ARC = 'arc',
  //   GERENCIA_NET = 'gerencia-net',
  //   IUGU = 'iugu',
  //   ASAAS = 'asaas',
  //   MERCADO_PAGO = 'mercado-pago',
  //   UNKNOWN = 'unknown',
  // }

  // export enum PaymentStateStatusView {
  //   PAID = 'paid',
  //   UNPAID = 'unpaid',
  //   PENDING = 'pending',
  // }

  // type ViewWithCardToken<Dto> = Dto & { readonly credit_card_token: string };

  // type ArcBankSlipResource = {
  //   barcode: string;
  //   barcode_link: string;
  // }

  // type ArcCreditCardResource = {
  //   token: string;
  // }

  // type ArcPixResource = {
  //   qr_code: string;
  //   qr_code_image: string;
  // }

  // type ArcCurrentGateway = {
  //   id: string;
  //   gateway: string;
  //   gateway_ref: string | null;
  //   priority: number;
  //   status: string;
  //   timeout_ms: number;
  //   inserted_at: string;
  //   updated_at: string;
  // }
}

