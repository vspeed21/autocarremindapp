# Pendientes v2

## Stats por tipo (carro vs moto)
Hoy `GraficasScreen.tsx` mezcla todos los vehículos en un solo total.
Agregar filtro Todos / Carros / Motos en las gráficas globales:
1. Cargar vehículos (`obtenerVehiculos`) y armar mapa `vehiculoId → tipo`.
2. Filtrar mantenimientos por ese mapa según el chip, antes de calcular
   gasto 6 meses y top 5.
3. Solo frontend (cada mantenimiento ya trae su `vehiculo`); sin backend.

## Punto verde de ubicación (convivir por ahora, revisar después)
Contexto: Android 12+ muestra el indicador mientras exista una solicitud
de ubicación activa. No se puede ocultar; solo se reduce el tiempo de escucha.
Decisión actual: escucha continua 30 s / 20 m.

1. Ajustar intervalos: 60–120 s / 50–100 m en `iniciarTracking`. 2 líneas.
2. Modo sondeo (BackgroundFetch): una sola posición cada ~15 min; continuo
   solo si hubo desplazamiento >200 m. Requiere `expo-background-fetch` +
   rebuild. Contra: viajes <15 min pueden perderse.
3. Modo manual: botón Iniciar/Detener viaje. Sin permiso "siempre".
4. Activity-gating: acelerómetro decide cuándo encender el GPS. Módulo
   nativo fuera de Expo, precisión gruesa.
5. Detección por Bluetooth del carro: la conexión dispara el GPS. Ataca el
   punto y el problema del bus. Solo si el carro tiene BT.
6. Horarios de tracking: GPS solo en ventanas configuradas.
7. Geocercas casa/trabajo: alta frecuencia solo fuera de zonas
   (`startGeofencingAsync`).
8. OBD-II por Bluetooth: odómetro exacto sin GPS. Requiere adaptador
   ELM327 por vehículo.
9. Sin GPS: recordatorio de odómetro cada X días. Manual.
10. Solo foreground: trackear únicamente con app abierta.
