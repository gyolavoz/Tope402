import express from "express";
import { paymentMiddlewareFromConfig } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactStellarScheme } from "@x402/stellar/exact/server";

const PORT = 3001;
const NETWORK = "stellar:testnet";
const PAY_TO = process.env.MI_PUBLICA; // la tienda cobra a tu cuenta

// Catálogo: cada dato tiene su precio en USDC (datos de ejemplo, no reales)
const CATALOGO = {
  "/tipo-cambio": { precio: "$0.01", dato: { par: "USD/PEN", compra: 3.74, venta: 3.77, ejemplo: true } },
  "/tasa-referencia": { precio: "$0.01", dato: { tasa: "4.25%", ejemplo: true } },
  "/reporte-pro": { precio: "$0.10", dato: { reporte: "Análisis de mercado completo", ejemplo: true } },
};

const app = express();

// Gratis: el menú con precios
app.get("/", (_, res) => res.json(Object.fromEntries(Object.entries(CATALOGO).map(([r, p]) => [r, p.precio]))));

// x402: cada ruta del catálogo cobra su precio antes de entregar el dato
const rutas = {};
for (const [ruta, { precio }] of Object.entries(CATALOGO)) {
  rutas[`GET ${ruta}`] = { accepts: { scheme: "exact", price: precio, network: NETWORK, payTo: PAY_TO } };
}
app.use(
  paymentMiddlewareFromConfig(
    rutas,
    new HTTPFacilitatorClient({ url: "https://www.x402.org/facilitator" }),
    [{ network: NETWORK, server: new ExactStellarScheme() }],
  ),
);

for (const [ruta, { dato }] of Object.entries(CATALOGO)) {
  app.get(ruta, (_, res) => res.json({ ...dato, pagado: true }));
}

app.listen(PORT, () => console.log(`🏪 Tienda de datos en http://localhost:${PORT}`));