import { Request } from "express";

export interface CreateLocationRequest extends Request {
    [key: string]: any
}
export interface CreateClinicRequest extends Request {
    [key: string]: any
}

export interface CreateClinicResponse extends Response {

    [key: string]: any
}