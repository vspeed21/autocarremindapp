import { fechaFirebase } from '../firebase';

export interface Vehiculo {
  id: string
  uid: string
  marca: string
  modelo: string
  year: string
  placa: string
  kilometraje: number
  tipo?: string
  cilindraje: number
  createdAt: fechaFirebase
  updatedAt: fechaFirebase
}

export interface VehiculosPost {
  marca: string
  modelo: string
  year: string
  placa: number
  kilometraje: number
}
