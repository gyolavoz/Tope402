import { writeFileSync } from "node:fs";
import { x402Client, x402HTTPClient, wrapFetchWithPayment } from "@x402/fetch";
import { createEd25519Signer } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";
import { decidir, aUnidades, aUSDC } from "./politica.js";

const TIENDA = process.env.TIENDA || "http://localhost:3001";
const NETWORK = "stellar:testnet";
const PRESUPUESTO = process.env.PRESUPUESTO || "0.03"; // lo máximo que puede gastar en esta sesión
const TOPE = process.env.TOPE || "0.02"; // lo máximo que paga por una sola compra
const COMPRAS = ["/tipo-cambio", "/tasa-referencia", "/reporte-pro", "/tipo-cambio", "/tasa-referencia"];

// El agente firma con SU wallet; x402 además bloquea cualquier pago sobre el tope
const signer = createEd25519Signer(process.env.AGENTE_SECRETA, NETWORK);
const client = x402Client.fromConfig({
  schemes: [{ network: "stellar:*", client: new ExactStellarScheme(signer, { url: "https://soroban-testnet.stellar.org" }) }],
  spendControls: { maxAmountPerPayment: `$${TOPE}` },
});
const http = new x402HTTPClient(client);
const fetchQuePaga = wrapFetchWithPayment(fetch, client);

let gastado = 0; // en unidades de 7 decimales
const registro = [];
console.log(`🤖 Agente ${signer.address}\n   Presupuesto ${PRESUPUESTO} USDC · tope ${TOPE} USDC por compra\n`);

for (const ruta of COMPRAS) {
  const url = TIENDA + ruta;
  try {
    // 1. Pregunta el precio sin pagar
    const r = await fetch(url);
    if (r.status !== 402) { console.log(`   ${ruta}: no cobra (status ${r.status})`); continue; }
    const precio = Number(http.getPaymentRequiredResponse((h) => r.headers.get(h)).accepts[0].amount);

    // 2. La política decide antes de firmar
    const d = decidir({ precio, gastado, presupuesto: aUnidades(PRESUPUESTO), tope: aUnidades(TOPE) });
    if (!d.pagar) {
      console.log(`⛔ ${ruta} · ${aUSDC(precio)} USDC · rechazado: ${d.motivo}`);
      registro.push({ ruta, precio: aUSDC(precio), pagado: false, motivo: d.motivo, fecha: new Date().toISOString() });
      continue;
    }

    // 3. Paga una vez con x402 y recibe el dato
    const res = await fetchQuePaga(url);
    const pago = http.getPaymentSettleResponse((h) => res.headers.get(h));
    const dato = await res.json();
    gastado += precio;
    console.log(`✅ ${ruta} · ${aUSDC(precio)} USDC · ${JSON.stringify(dato)}`);
    console.log(`   https://stellar.expert/explorer/testnet/tx/${pago.transaction}`);
    registro.push({ ruta, precio: aUSDC(precio), pagado: true, hash: pago.transaction, fecha: new Date().toISOString() });
  } catch (e) {
    console.log(`❌ ${ruta}: falló (${e.message}). El agente se detiene para no pagar a ciegas.`);
    break;
  }
}

// 4. Registro auditable de cada decisión
writeFileSync(new URL("./gastos.json", import.meta.url), JSON.stringify(registro, null, 2));
const compras = registro.filter((x) => x.pagado).length;
console.log(`\n📒 Resumen: gastó ${aUSDC(gastado)} de ${PRESUPUESTO} USDC · ${compras} compras · ${registro.length - compras} rechazadas · registro en gastos.json`);