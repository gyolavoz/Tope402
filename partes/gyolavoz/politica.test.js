import { test } from "node:test";
import assert from "node:assert/strict";
import { decidir, aUnidades } from "./politica.js";

const presupuesto = aUnidades("0.03");
const tope = aUnidades("0.02");

test("paga si el precio está dentro del tope y del presupuesto", () => {
  assert.equal(decidir({ precio: aUnidades("0.01"), gastado: 0, presupuesto, tope }).pagar, true);
});

test("rechaza si el precio supera el tope por compra", () => {
  const d = decidir({ precio: aUnidades("0.10"), gastado: 0, presupuesto, tope });
  assert.equal(d.pagar, false);
  assert.match(d.motivo, /tope/);
});

test("rechaza si la compra haría pasar el presupuesto", () => {
  const d = decidir({ precio: aUnidades("0.01"), gastado: aUnidades("0.03"), presupuesto, tope });
  assert.equal(d.pagar, false);
  assert.match(d.motivo, /presupuesto/);
});

test("en una lista larga de compras nunca supera el presupuesto", () => {
  let gastado = 0;
  for (const p of ["0.01", "0.01", "0.10", "0.01", "0.01", "0.02", "0.01"]) {
    const precio = aUnidades(p);
    if (decidir({ precio, gastado, presupuesto, tope }).pagar) gastado += precio;
  }
  assert.ok(gastado <= presupuesto);
});

test("sin errores de redondeo: 3 compras de 0.01 llenan exacto 0.03", () => {
  let gastado = 0;
  for (let i = 0; i < 3; i++) {
    const precio = aUnidades("0.01");
    assert.equal(decidir({ precio, gastado, presupuesto, tope }).pagar, true);
    gastado += precio;
  }
  assert.equal(gastado, presupuesto);
});