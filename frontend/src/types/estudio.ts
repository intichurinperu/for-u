export interface RegistroEstudio {
  id: string;
  nombre: string;
  email: string;
  instagram: string;
  rubro: 'restaurante' | 'cafeteria' | 'tienda' | 'turismo' | 'cursos' | 'hospedaje';
  creadoEn: string;
  completado: boolean;
}

export interface ChecklistPreparacion {
  fotosSubidas: number;
  descripcionUnica: string;
  precioPrincipal: string;
  contraseñasListas: boolean;
  completado: boolean;
}

export interface HorarioDisponible {
  id: string;
  fecha: string;
  hora: string;
  cuposTotales: number;
  cuposOcupados: number;
  disponible: boolean;
}

export interface ReservaAsesoria {
  id: string;
  registroId: string;
  horarioId: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  whatsappEnviado: boolean;
}
