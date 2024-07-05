const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.post('/', async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const result = await db.query(
            'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
            [code, industry]
        );
        return res.status(201).json({ industry: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT i.code, i.industry, ARRAY_AGG(ci.company_code) AS companies
             FROM industries AS i
             LEFT JOIN companies_industries AS ci ON i.code = ci.industry_code
             GROUP BY i.code, i.industry`
        );
        return res.json({ industries: result.rows });
    } catch (e) {
        return next(e);
    }
});

router.post('/companies/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { industry_code } = req.body;

        const companyResult = await db.query(
            'SELECT code FROM companies WHERE code = $1',
            [code]
        );

        if (companyResult.rows.length === 0) {
            throw new ExpressError(`Company with code ${code} not found`, 404);
        }

        const industryResult = await db.query(
            'SELECT code FROM industries WHERE code = $1',
            [industry_code]
        );

        if (industryResult.rows.length === 0) {
            throw new ExpressError(`Industry with code ${industry_code} not found`, 404);
        }

        const result = await db.query(
            'INSERT INTO companies_industries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code',
            [code, industry_code]
        );

        return res.status(201).json({ association: result.rows[0] });

    } catch (e) {
        return next(e);
    }
});

module.exports = router;