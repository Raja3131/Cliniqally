import express from "express";
import {createServiceProvider,getServiceProvider,getServiceProviderById,updateServiceProvider,deleteServiceProvider} from "../../../../bl/admin/v1/ServiceProvider";
import { adminAuthMiddleWare } from "../../middleware/admin";
import {createServiceProviderValidation,validate} from "../../../../bl/admin/validations/serviceProviderValidation";

const router = express.Router();

router.post("/create-service-provider",adminAuthMiddleWare,validate(createServiceProviderValidation()),async (req: any, res: any, next) => {
createServiceProvider(req, res);
});

router.get("/get-service-provider",adminAuthMiddleWare,async (req: any, res: any, next) => {
    getServiceProvider(req, res);
 });

router.get("/get-service-provider-by-id/:provider_id",adminAuthMiddleWare,async (req: any, res: any, next) => {
    getServiceProviderById(req, res);
});

router.patch("/update-service-provider/:provider_id",adminAuthMiddleWare,validate(createServiceProviderValidation()),async (req: any, res: any, next) => {
    updateServiceProvider(req, res);
});

router.post("/delete-service-provider/:provider_id",adminAuthMiddleWare,async (req: any, res: any, next) => {
    deleteServiceProvider(req, res);
  }
);

export const adminServiceProviderRouter = router;
