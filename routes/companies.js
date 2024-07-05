const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const slugify = require('slugify');
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }

});


router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        // Fetch company details
        const companyResult = await db.query(
            'SELECT code, name, description FROM companies WHERE code = $1',
            [code]
        );

        if (companyResult.rows.length === 0) {
            throw new ExpressError(`${code} is not a valid code!`, 404);
        }

        const company = companyResult.rows[0];

        // Fetch associated invoices
        const invoicesResult = await db.query(
            'SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE comp_code = $1',
            [code]
        );

        const invoices = invoicesResult.rows;

        // Fetch associated industries
        const industriesResult = await db.query(
            `SELECT i.industry FROM industries AS i
             JOIN companies_industries AS ci ON i.code = ci.industry_code
             WHERE ci.company_code = $1`,
            [code]
        );

        const industries = industriesResult.rows.map(row => row.industry);

        company.invoices = invoices;
        company.industries = industries;

        return res.json({ company });
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    const { name, description } = req.body;
    const code =slugify(name);
    const result = await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`, [code, name, description]);

    return res.status(201).json({ company: result.rows[0] });

});

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        const result = await db.query(`
            UPDATE companies SET name =$1, description= $2
            WHERE code=$3
            RETURNING code, name, description`, [name, description, code]);

        if (result.rows.length === 0) throw new ExpressError(`${code} is not a valid code!`, 404);

        return res.json({ company: result.rows[0] })

    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;

        const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);

        if(result.rowCount === 0) throw new ExpressError(`${code} is not a valid code!`, 404);

        return res.json({ status: "deleted" });

    } catch (e) {
        return next(e);
    }
});





module.exports = router;