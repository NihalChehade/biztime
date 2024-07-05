process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
const db = require("./db");

beforeEach(async function(){
    const compRes = await db.query(`INSERT INTO companies (code, name, description)
        VALUES ('codeTest1', 'nameTest1', 
        'descriptionTest1') 
        RETURNING code, name, description`);
        
    const invRes =await db.query(`INSERT INTO invoices (comp_code, amt)
        VALUES ('${compRes.rows[0].code}', 15)
        RETURNING id, amt, paid, add_date, paid_date`);
    global.code = compRes.rows[0].code;
    global.comp_name = compRes.rows[0].name;
    global.description = compRes.rows[0].description;
    global.id = invRes.rows[0].id;
    global.amt = invRes.rows[0].amt;
    global.paid = invRes.rows[0].paid;
    global.add_date = invRes.rows[0].add_date;
    global.add_date = add_date.toISOString();
    global.paid_date =invRes.rows[0].paid_date;

});

afterEach(async function(){
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`)
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("get all invoices", async () => {
      const res =  await request(app).get("/invoices");
      expect(res.statusCode).toBe(200);

      expect(res.body).toEqual({invoices: [{id, comp_code: code}]});
    });
});

describe("POST /invoices", () =>{
    test("Create an invoice", async () => {
        const res = await request(app).post("/invoices").send({comp_code: "codeTest1", amt:19})
        expect(res.statusCode).toBe(201);
        
    } )
});

describe("GET /invoices/:id", () => {
    test("get invoice by id", async () => {
      const res =  await request(app).get(`/invoices/${id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({invoice:{ id, amt, paid, add_date, paid_date, company:{code, name:comp_name, description}}});
    });

    test("get invoice by invalid id", async () => {
        const res =  await request(app).get("/invoices/65");
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ 
            error : { message: "65 is not a valid id!", status: 404}
        });
      });
})

describe("Put /invoices/:id", () => {
    test("Update an invoice amt", async () => {
        const res = await request(app).put(`/invoices/${id}`).send({amt:20});
        expect(res.statusCode).toBe(200);
    });

    test("for invalid id", async () =>{
        const res = await request(app).put("/invoices/50").send({amt:70});
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ 
            error : { message: "50 is not a valid id!", status: 404}
        });
    });
});

describe("Delete /invoices/:id", () => {
    test("Delete an invoice by id ", async () => {
        const res = await request(app).delete(`/invoices/${id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    })
    test("Delete an invoice by invalid id", async () =>{
        const res = await request(app).delete("/invoices/38");
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ 
            error : { message: "38 is not a valid id!", status: 404}
        });
    });
});