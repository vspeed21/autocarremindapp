import { cerrarSesion, getMe, loginUser, signUpUser } from '../services/api/AuthService';
import { actualizarMantenimiento, agregarMantenimiento, eliminarMantenimiento, getCatalogoMantenimientos, getMantenimientos, getMisMantenimientos } from '../services/api/MantenimientosService';
import { getMarcas, getModelos } from '../services/api/CatalogoService';
import { getCurrentUserInfo, updateUserConfig, getUserStats } from '../services/api/UsuariosService';
import { actualizarVehiculo, crearVehiculo, obtenerVehiculos, sumarKilometraje } from '../services/api/vehiculoServices';
import { agregarTanqueada, eliminarTanqueada, getTanqueadas } from '../services/api/CombustibleService';
import { getRecordatorios } from '../services/api/RecordatoriosService';
import { getItem, removeItem, saveItem } from './system/storage';

import { getDeviceToken, getPermisoNotificacion, notificarViaje } from './system/notifications';

export type { UserStats, StatsPorVehiculo } from '../services/api/UsuariosService';
export type { MarcaCatalogo, ModeloCatalogo } from '../services/api/CatalogoService';
export type { Recordatorio, RecordatorioVehiculo } from '../services/api/RecordatoriosService';
export type { Tanqueada } from '../services/api/CombustibleService';

export {
  actualizarVehiculo, actualizarMantenimiento, agregarMantenimiento, agregarTanqueada, cerrarSesion, crearVehiculo, eliminarMantenimiento, eliminarTanqueada, getCatalogoMantenimientos, getCurrentUserInfo, getDeviceToken, getItem, getMantenimientos, getMarcas, getMe, getMisMantenimientos, getModelos, getPermisoNotificacion, getRecordatorios, getTanqueadas, getUserStats, loginUser, notificarViaje, obtenerVehiculos, removeItem,
  saveItem, signUpUser, sumarKilometraje, updateUserConfig
};

