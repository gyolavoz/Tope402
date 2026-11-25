# Parte de gyolavoz

Agente que compra datos con x402 dentro de un presupuesto total y un tope por compra. Antes de firmar, consulta su política de gasto; si el precio supera el tope o se pasaría del presupuesto, rechaza sin generar transacción. Cada decisión queda en `gastos.json`.

## Cómo correr mi parte

```
node --env-file=.env partes/gyolavoz/crear-agente.js
node --env-file=.env partes/gyolavoz/tienda.js &
node --env-file=.env partes/gyolavoz/agente.js
npm test
```

## Hashes de prueba (pagos del agente)

- cf2926a9181aba39fb6201f27d59886ac17d71cc74fa3a20779bac66a58fed22 · [Verlo](https://stellar.expert/explorer/testnet/tx/cf2926a9181aba39fb6201f27d59886ac17d71cc74fa3a20779bac66a58fed22)
- e4703f9c5d5b297ffa9c539334af562e3a9b2c82efc104350969652d8351bb70 · [Verlo](https://stellar.expert/explorer/testnet/tx/e4703f9c5d5b297ffa9c539334af562e3a9b2c82efc104350969652d8351bb70)
- 061d13c45a0f2503cd0ed07d82eca9c54bf3ff78643d8f89188edfb7bb5522e9 · [Verlo](https://stellar.expert/explorer/testnet/tx/061d13c45a0f2503cd0ed07d82eca9c54bf3ff78643d8f89188edfb7bb5522e9)
