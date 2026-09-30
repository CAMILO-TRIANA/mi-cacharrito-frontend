import { Usuario } from './usuario';
import { Vehiculo } from './vehiculo';

export class Alquiler {
  id?: number;
  numeroAlquiler?: string;
  usuario!: Usuario;
  vehiculo!: Vehiculo;
  fechaInicio: string = '';
  fechaEntregaPactada: string = '';
  fechaEntregaReal?: string;
  valorTotal?: number;
  estado: string = 'pendiente de entrega';
}
