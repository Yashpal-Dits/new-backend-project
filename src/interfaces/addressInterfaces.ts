export interface ICreateAddressRequest {
    address_line : string;
    city : string;
    state: string;
    zip_code: string;
    country : string;
}

export interface IUpdateAddressRequest extends Partial<ICreateAddressRequest> {}

export interface IAddressResponse {
    id: number;
    user_id: number,
    address_line : string;
    city : string;
    state: string;
    zip_code: string;
    country : string;
    created_at: Date;
    updated_at: Date;
}

export interface IAddressServiceResponse<T =any> {
    success: boolean;
    message: string;
    data? : T;
    timestamp: string; 
}