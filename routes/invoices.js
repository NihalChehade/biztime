const express = require("express");
const router = new express.Router();

const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices;`);
        return res.json({ invoices: results.rows });
    } catch (e) {
        return next(e);
    }

});

router.get('/:id', async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT invoices.id, invoices.amt, invoices.paid, invoices.add_date, invoices.paid_date, companies.code, companies.name, companies.description
            FROM invoices
            JOIN companies
            ON invoices.comp_code = companies.code
            WHERE id =$1`, [req.params.id]);

        if (result.rows.length === 0) throw new ExpressError(`${req.params.id} is not a valid id!`, 404);

        const data = result.rows[0];

        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        };

        return res.json({ invoice: invoice });

    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    const { comp_code, amt } = req.body;
    const result = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

    return res.status(201).json({ invoice: result.rows[0] });
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        // Get the current state of the invoice
        const currentResult = await db.query(
            'SELECT paid FROM invoices WHERE id=$1',
            [id]
        );

        if (currentResult.rows.length === 0) {
            throw new ExpressError(`${id} is not a valid id!`, 404);
        }

        const currentPaidStatus = currentResult.rows[0].paid;
        let paidDate = null;

        // Determine the new paid_date based on the paid status
        if (paid && !currentPaidStatus) {
            paidDate = new Date();
        } else if (!paid && currentPaidStatus) {
            paidDate = null;
        } else {
            paidDate = currentResult.rows[0].paid_date;
        }

        // Update the invoice with the new values
        const result = await db.query(
            `UPDATE invoices SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]
        );

        if (result.rows.length === 0) {
            throw new ExpressError(`${id} is not a valid id!`, 404);
        }

        return res.json({ invoice: result.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(`DELETE FROM invoices WHERE id=$1`, [id]);
        console.log(result)
        if (result.rowCount === 0) throw new ExpressError(`${id} is not a valid id!`, 404);
        return res.json({ status: "deleted" });

    } catch (e) {
        return next(e);
    }
});



module.exports = router;