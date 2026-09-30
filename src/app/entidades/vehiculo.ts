export class Vehiculo {
  id?: number;
  placa: string = '';
  tipoVehiculo: string = '';
  color: string = '';
  valorDia: number = 0;
  estado: string = 'disponible';
  marca?: string;
  modelo?: string;
  anio?: number;
  pasajeros?: number;
  transmision?: string;
  imagenUrl?: string;
}
