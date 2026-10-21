import { cerrarSesion, getMe, loginUser, signUpUser } from '../services/api/AuthService';
import { getCatalogoMantenimientos, getMarcas, getModelos } from '../services/api/CatalogoService';
import { agregarTanqueada, eliminarTanqueada, getTanqueadas } from '../services/api/CombustibleService';
import { actualizarMantenimiento, agregarMantenimiento, eliminarMantenimiento, getMantenimientos, getMisMantenimientos } from '../services/api/MantenimientosService';
import { getRecordatorios } from '../services/api/RecordatoriosService';
import { getCurrentUserInfo, getUserStats, updateUserConfig } from '../services/api/UsuariosService';
import { actualizarVehiculo, crearVehiculo, eliminarVehiculo, obtenerVehiculos, sumarKilometraje } from '../services/api/vehiculoServices';
import { getItem, removeItem, saveItem } from './system/storage';

import { getDeviceToken, getPermisoNotificacion, notificarViaje } from './system/notifications';

export type { MarcaCatalogo, ModeloCatalogo } from '../services/api/CatalogoService';
export type { Tanqueada } from '../services/api/CombustibleService';
export type { Recordatorio, RecordatorioVehiculo } from '../services/api/RecordatoriosService';
export type { StatsPorVehiculo, UserStats } from '../services/api/UsuariosService';

export {
  actualizarMantenimiento, actualizarVehiculo, agregarMantenimiento, agregarTanqueada, cerrarSesion, crearVehiculo, eliminarMantenimiento, eliminarTanqueada, eliminarVehiculo, getCatalogoMantenimientos, getCurrentUserInfo, getDeviceToken, getItem, getMantenimientos, getMarcas, getMe, getMisMantenimientos, getModelos, getPermisoNotificacion, getRecordatorios, getTanqueadas, getUserStats, loginUser, notificarViaje, obtenerVehiculos, removeItem,
  saveItem, signUpUser, sumarKilometraje, updateUserConfig
};

