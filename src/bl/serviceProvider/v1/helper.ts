import { Request } from "express";

export interface CreateClinicRequest extends Request {
    [key: string]: any
}

export interface CreateClinicResponse extends Response {
    [key: string]: any
}