// Política de gasto del agente: el dueño define las reglas, el agente las cumple.
// Trabaja en unidades de 7 decimales (0.01 USDC = 100000) para evitar errores de redondeo.
export const aUnidades = (usdc) => Math.round(Number(usdc) * 1e7);
export const aUSDC = (u) => u / 1e7;

export function decidir({ precio, gastado, presupuesto, tope }) {
  if (precio > tope) return { pagar: false, motivo: `supera el tope por compra (${aUSDC(tope)} USDC)` };
  if (gastado + precio > presupuesto)
    return { pagar: false, motivo: `se pasaría del presupuesto (${aUSDC(presupuesto)} USDC; ya gastó ${aUSDC(gastado)})` };
  return { pagar: true, motivo: "dentro del tope y del presupuesto" };
}