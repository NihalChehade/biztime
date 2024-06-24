const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");

const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies;`);
        return res.json({ companies: results.rows });
    } catch (e) {
        return next(e);
    }

});

router.get('/:code', async (req, res, next) => {
    try {
        console.log("########################")
        const result = await db.query(`SELECT * FROM companies JOIN invoices ON companies.code = invoices.comp_code WHERE code =$1`, [req.params.code]);
        if (result.rows.length === 0) return new ExpressError(`${code} is not a valid code!`, 404);
        const data = result.rows[0];
        const company= {
              code: data.code,
              name: data.name,
              description: data.description,
              invoices:[
                data.id,
                data.amt,
                data.paid,
                data.add_date,
                data.paid_date,
              ]
            };
          
        return res.json({ company });
    } catch (e) {
        console.log(e)
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    const { code, name, description } = req.body;
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
    return res.status(201).json({ company: result.rows[0] });
});

router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        const result = await db.query(`UPDATE companies SET name =$1, description= $2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (result.rows.length === 0) return new ExpressError(`${code} is not a valid code!`, 404);
        return res.json({ company: result.rows[0] })

    } catch (e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;


        const result = await db.query(`DELETE FROM companies WHERE code=$1`, [code]);
        console.log(result.rowCount)
        if(result.rowCount === 0) return new ExpressError(`${code} is not a valid code!`, 404);
        return res.json({ status: "deleted" });

    } catch (e) {
        return next(e);
    }
});





module.exports = router;