export interface Respuesta {
    id: number;
    usuario_id: number;
    seccion_id: number;
    campo_id?: number;
    respuesta_texto?: string;
    respuesta_json?: any;
    estado_avance: 'sin_avances' | 'en_desarrollo' | 'completado';
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface RespuestaRequest {
    usuario_id: number;
    seccion_id: number;
    campo_id?: number;
    respuesta_texto?: string | null;
    respuesta_json?: any;
    estado_avance: 'sin_avances' | 'en_desarrollo' | 'completado';
}

// ============================================
// DTOs para API de Secciones (nuevo backend)
// ============================================

/** Request para guardar/actualizar sección */
export interface GuardarSeccionRequest {
    usuarioId: number;
    seccionCodigo: string;
    datos: Record<string, any>;
    estadoAvance?: 'sin_avances' | 'en_desarrollo' | 'completado';
    progresoPorcentaje?: number;
}

/** Respuesta del endpoint de secciones */
export interface RespuestaSeccionDTO {
    id: number;
    usuarioId: number;
    seccionCodigo: string;
    datos: Record<string, any>;
    estadoAvance: 'sin_avances' | 'en_desarrollo' | 'completado';
    estadoProfesor?: 'sin_avances' | 'en_desarrollo' | 'completado' | null;
    progresoPorcentaje: number;
    fechaCreacion: string;
    fechaActualizacion: string;
}

export interface EstadoSeccion {
    usuario_id: number;
    seccion_id: number;
    estado: 'sin_avances' | 'en_desarrollo' | 'completado';
    fecha_actualizacion?: string;
}

// ============================================
// Interfaces JSON por Sección
// ============================================

/** Sección 1: Identificación de tu curso (seccion_id: 1) */
export interface CaracterizaJson {
    datosBasicos: {
        programa?: string;
        nombreAsignatura?: string;
        tipoAsignatura?: string;
        semestre?: string;
        creditos?: number;
        horasPresenciales?: number;
        horasIndependientes?: number;
    };
    justificacion: {
        respuesta?: string;
    };
}

/** Sección 2: Factores (seccion_id: 2) */
export interface FactoresJson {
    ecosistema: {
        numEstudiantes?: number;
        numDocentes?: number;
        liderExito?: string;
        liderFortalecimiento?: string;
        unidadAdscrita?: string;
        unidadesDicta?: string;
        aspectosImportantes?: string;
    };
    resultadosAprendizaje: string[];
    contenidos: {
        topics?: { id: number; name: string }[];
        subtopics?: { id: number; topicId: number; name: string }[];
    };
    panel1: {
        pregunta1?: string;
        pregunta2?: string;
        pregunta3?: string;
        pregunta4?: string;
        pregunta5?: string;
        pregunta6?: string;
        pregunta7?: string;
        pregunta8?: string;
        pregunta9?: string;
        detallePregunta9?: string;
    };
    panel2: {
        pregunta10?: string;
        pregunta11?: string;
        pregunta12?: string;
        pregunta13?: string;
    };
    panel3: {
        pregunta14?: string;
        pregunta15?: string;
        pregunta16?: string;
        pregunta17?: string;
    };
}

/** Sección 3: Ajustes Razonables (seccion_id: 3) */
export interface AjustesRazonablesJson {
    ajustes: AjusteItem[];
}

export interface AjusteItem {
    desde?: string;
    ajuste?: string;
    siNo?: string;
    comoHacerlo?: string;
}

/** Sección 4: RAP/RAC (seccion_id: 4) */
export interface RapRacJson {
    rac: {
        compromiso?: string;
        humanas?: string;
        conocimiento?: string;
        aplicacion?: string;
        integracion?: string;
        aprender?: string;
    };
    rap: {
        resultados: string[];
    };
}

/** Sección 5: Actividades de Aprendizaje (seccion_id: 5) */
export interface ActividadesAprendizajeJson {
    actividades: ActividadItem[];
}

export interface ActividadItem {
    ra?: string;
    tema?: string;
    subtema?: string;
    dimension?: string;
    metodologia?: string;
    descripcion?: string;
}

/** Sección 6: Evaluación (seccion_id: 6) */
export interface ComoEvaluareJson {
    programaSeleccionado?: 'pregrado' | 'posgrado';
    dimensiones: EvaluacionDimensionItem[];
    criteriosChecklist: CriterioChecklistItem[];
}

export interface EvaluacionDimensionItem {
    dimensionNombre?: string;
    resultadoAprendizaje?: string;
    data?: Record<string, any>;
}

export interface CriterioChecklistItem {
    titulo?: string;
    preguntas: string[];
}

/** Unión de todos los tipos JSON de sección */
export type SeccionJsonData =
    | CaracterizaJson
    | FactoresJson
    | AjustesRazonablesJson
    | RapRacJson
    | ActividadesAprendizajeJson
    | ComoEvaluareJson;