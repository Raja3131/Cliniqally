import express from 'express';
import {
    createCity, createCountry, createState, deleteCity, deleteCountry, deleteState, getCities, getCityById, getCountries, getCountryById, getStateById, getStates, updateCity, updateCountry, updateState
} from "../../../../bl/admin/v1/location";
import { createCityValidation, createCountryValidation, createStateValidation, validate } from '../../../../bl/admin/validations/locationValidation';
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

// country apis
router.post("/create-country", adminAuthMiddleWare, validate(createCountryValidation()), async (req: any, res: any, next) => {
    createCountry(req, res);
});

router.get("/list-country", async (req: any, res: any, next: any) => {
    getCountries(req, res);
});

router.patch("/update-country/:country_id", adminAuthMiddleWare, validate(createCountryValidation()), async (req: any, res: any, next) => {
    updateCountry(req, res);
});

router.get("/country/:country_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getCountryById(req, res);
});

router.post("/delete-country/:country_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteCountry(req, res);
});

// state apis
router.post("/create-state", adminAuthMiddleWare, validate(createStateValidation()), async (req: any, res: any, next) => {
    createState(req, res);
});

router.get("/list-state", async (req: any, res: any, next: any) => {
    getStates(req, res);
});

router.patch("/update-state/:state_id", adminAuthMiddleWare, validate(createStateValidation()), async (req: any, res: any, next) => {
    updateState(req, res);
});

router.get("/state/:state_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getStateById(req, res);
});

router.post("/delete-state/:state_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteState(req, res);
});

// city apis
router.post("/create-city", adminAuthMiddleWare, validate(createCityValidation()), async (req: any, res: any, next) => {
    createCity(req, res);
});

router.get("/list-city", async (req: any, res: any, next: any) => {
    getCities(req, res);
});

router.patch("/update-city/:city_id", adminAuthMiddleWare, validate(createCityValidation()), async (req: any, res: any, next) => {
    updateCity(req, res);
});

router.get("/city/:city_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getCityById(req, res);
});

router.post("/delete-city/:city_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteCity(req, res);
});


export const locationRouter = router;