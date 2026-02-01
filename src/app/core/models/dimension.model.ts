export interface Dimension {
  tipo: 'cognitiva' | 'procedimental' | 'actitudinal';
  estado: 'En desarrollo' | 'Completo';

  evaluacion: {
    medios: any[];
    otroMedio: boolean;
    otroMedioTexto: string;

    tecnicas: any[];
    otraTecnica: boolean;
    otraTecnicaTexto: string;

    instrumentos: any[];
    otroInstrumento: boolean;
    otroInstrumentoTexto: string;
  };

  configuracion: {
    tipoEvaluacion: any;
    otroTipoEvaluacion: boolean;
    otroTipoEvaluacionTexto: string;

    participantes: any;
    otrosParticipantes: boolean;
    otrosParticipantesTexto: string;

    momento: any;
  };

  criterios: string[];
}
