process.env.NODE_ENV = "test";

const request = require("supertest");
const slugify = require('slugify');
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
    global.inv_id = invRes.rows[0].id;
    global.inv_amt = invRes.rows[0].amt;
    global.inv_paid = invRes.rows[0].paid;
    global.inv_add_date = invRes.rows[0].add_date;
    global.inv_add_date = inv_add_date.toISOString();
    global.inv_paid_date =invRes.rows[0].paid_date;

});

afterEach(async function(){
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`)
});

afterAll(async () => {
    await db.end();
});

describe("GET /companies", () => {
    test("get all companies", async () => {
      const res =  await request(app).get("/companies");
      expect(res.statusCode).toBe(200);

      expect(res.body).toEqual({companies: [{code: "codeTest1", name:"nameTest1"}]});
    });
});

describe("POST /companies", () =>{
    test("Create a company", async () => {
        const code =slugify("nameTest2");
        const res = await request(app).post("/companies").send({name:"nameTest2", description:"descriptionTest2"})
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company:{code, name:"nameTest2", description:"descriptionTest2"}})
    } )
});

describe("GET /companies/:code", () => {
    test("get company by code", async () => {
      const res =  await request(app).get("/companies/codeTest1");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({company:{code: "codeTest1", name:"nameTest1", description:"descriptionTest1", invoices: [
        inv_id,
        inv_amt,
        inv_paid,
        inv_add_date,
        inv_paid_date]}});
    });

    test("get company by invalid code", async () => {
        const res =  await request(app).get("/companies/carrotface");
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ 
            error : { message: "carrotface is not a valid code!", status: 404}
        });
      });
})

describe("Put /companies/:code", () => {
    test("Update a company name and/or desrription", async () => {
        const res = await request(app).put(`/companies/codeTest1`).send({name: "newNameTest1", description : "newDescriptionTest1"});
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({company: {code: "codeTest1", name: "newNameTest1", description : "newDescriptionTest1"}});
    });
    test("for invalid code", async () =>{
        const res = await request(app).put("/companies/cucumber").send({name: "newNameTest1", description : "newDescriptionTest1"});
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ 
            error : { message: "cucumber is not a valid code!", status: 404}
        });
    });
});

describe("Delete /companies/:code", () => {
    test("Delete a company by code ", async () => {
        const res = await request(app).delete(`/companies/codeTest1`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ status: "deleted" });
    })
    test("Delete a company by invalid code", async () =>{
        const res = await request(app).delete("/companies/invalidCode");
        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ 
            error : { message: "invalidCode is not a valid code!", status: 404}
        });
    });
});