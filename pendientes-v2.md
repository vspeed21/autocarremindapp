# Pendientes v2

## Stats por tipo (carro vs moto)
Hoy `GraficasScreen.tsx` mezcla todos los vehículos en un solo total.
Agregar filtro Todos / Carros / Motos en las gráficas globales:
1. Cargar vehículos (`obtenerVehiculos`) y armar mapa `vehiculoId → tipo`.
2. Filtrar mantenimientos por ese mapa según el chip, antes de calcular
   gasto 6 meses y top 5.
3. Solo frontend (cada mantenimiento ya trae su `vehiculo`); sin backend.
