/**
 * Mapeo de labels y metadatos para la vista de revisión del tutor.
 * Coincide con los labels que el estudiante ve en sus módulos de bitácora.
 */

export interface PanelMeta {
    panelLabel: string;
    /** 'fields' = key-value pairs, 'table' = array of rows, 'list' = array of strings, 'info' = solo conteo */
    displayType: 'fields' | 'table' | 'list' | 'info';
    fields?: Record<string, string>;
    columns?: { key: string; label: string }[];
    infoLabel?: string;
}

export type SeccionLabelsMap = Record<string, Record<string, PanelMeta>>;

/**
 * Mapeo de valores de selects/multiselects a labels legibles.
 * Cubre todos los dropdowns de la bitácora.
 */
export const SELECT_VALUE_LABELS: Record<string, string> = {
    // Secuencia - tipo
    'async': 'Asíncrona',
    'sync': 'Síncrona',
    // Secuencia - actividades (multiselect values)
    'lectura': 'Lectura de material',
    'video': 'Video educativo',
    'taller': 'Taller práctico',
    'debate': 'Debate grupal',
    'exposicion': 'Exposición',
    'colaborativo': 'Trabajo colaborativo',
    'evaluacion': 'Evaluación',
    'foro': 'Foro de discusión',
    'caso': 'Estudio de caso',
    'proyecto': 'Proyecto',
    // Actividades - metodologia
    'proyectos': 'Aprendizaje basado en proyectos',
    'juegos': 'Aprendizaje basado en juegos',
    'invertido': 'Aprendizaje invertido',
    'evidencia': 'Aprendizaje basado en evidencia',
    'dialogo': 'Diálogo reflexivo',
    'cooperativo': 'Aprendizaje cooperativo',
    'problemas': 'Aprendizaje basado en problemas',
    'investigacion': 'Investigación - Acción',
    'servicio': 'Aprendizaje a través del servicio',
    'adaptativo': 'Aprendizaje adaptativo',
    // Ajustes - siNo
    'SI': 'Sí',
    'NO': 'No',
    // Factores pregunta9
    'si': 'Sí',
    'no': 'No',
    // Evaluacion - programaSeleccionado
    'pregrado': 'Pregrado',
    'posgrado': 'Posgrado',
};

export const BITACORA_LABELS: SeccionLabelsMap = {
    'caracteriza': {
        'datosBasicos': {
            panelLabel: 'Identificación de la asignatura',
            displayType: 'fields',
            fields: {
                'programa': 'Programa',
                'nombreAsignatura': 'Nombre de asignatura',
                'tipoAsignatura': 'Tipo de asignatura',
                'semestre': 'Semestre',
                'periodoAcademico': 'Periodo Académico',
                'prerequisito': 'Prerrequisito',
                'materiaPrerequisito': 'Materia Prerrequisito',
                'numeroCreditos': 'Número de créditos',
                'horasDirecto': 'Horas de trabajo directo',
                'horasIndependiente': 'Horas de trabajo independiente'
            }
        },
        'equipoDocente': {
            panelLabel: 'Equipo Docente',
            displayType: 'table',
            columns: [
                { key: 'rol', label: 'Cargo' },
                { key: 'name', label: 'Nombre' },
                { key: 'email', label: 'Correo' },
                { key: 'attention', label: 'Atención' },
                { key: 'days', label: 'Días' },
                { key: 'schedule', label: 'Horario' },
                { key: 'site', label: 'Lugar asignado' }
            ]
        },
        'justificacion': {
            panelLabel: 'Justificación',
            displayType: 'fields',
            fields: {
                'respuesta1': 'Respuesta 1',
                'respuesta2': 'Respuesta 2',
                'respuesta3': 'Respuesta 3'
            }
        },
        'contenidos': {
            panelLabel: 'Contenidos',
            displayType: 'table',
            columns: [
                { key: 'tema', label: 'Módulo/Unidad/Tema' },
                { key: 'subtema', label: 'Subtema' }
            ]
        }
    },

    'factores': {
        'panel1': {
            panelLabel: 'a. Contexto Específico de la situación de Enseñanza/Aprendizaje',
            displayType: 'fields',
            fields: {
                'pregunta1': '1. ¿El curso hace parte de un programa de pregrado, o posgrado?',
                'pregunta2': '2. ¿Tu curso es de inicio, mitad o final de programa?',
                'pregunta3': '3. ¿Cuántos estudiantes hay en tu aula?',
                'pregunta4': '4. ¿El curso es presencial, virtual, híbrido?',
                'pregunta5': '5. ¿Este tema es principalmente teórico, práctico o una combinación de ambos?',
                'pregunta6': '6. ¿Tu curso es de fundamentación, disciplinar, de profundización, electivo?',
                'pregunta7': '7. ¿Tu curso requiere actualización permanente, o es una temática estable que cambia poco?',
                'pregunta8': '8. ¿Tu curso tiene prerrequisitos o correquisitos?',
                'pregunta9': '9. ¿Tu curso es prerrequisito de otro?',
                'detallePregunta9': '¿Cuál?'
            }
        },
        'panel2': {
            panelLabel: 'b. Características de los estudiantes',
            displayType: 'fields',
            fields: {
                'pregunta10': '10. ¿Cuáles son las características biopsicosociales, culturales, académicas y económicas de tus estudiantes?',
                'pregunta11': '11. ¿Qué conocimiento previo, experiencias y predisposiciones iniciales suelen tener los estudiantes sobre el tema?',
                'pregunta12': '12. ¿Cuáles son los estilos preferidos de aprendizaje de tus estudiantes?',
                'pregunta13': '13. ¿Conoces las características de diversidad de los estudiantes que integrarán tu curso?'
            }
        },
        'panel3': {
            panelLabel: 'c. Tus características como docente',
            displayType: 'fields',
            fields: {
                'pregunta14': '14. ¿Qué experiencia docente tienes en la enseñanza de este curso o de temas relacionados?',
                'pregunta15': '15. ¿Qué te motiva a enseñar este tema en particular?',
                'pregunta16': '16. ¿Qué resultados has obtenido en la evaluación de este curso anteriormente?',
                'pregunta17': '17. ¿Cómo describes tu estilo de enseñanza?'
            }
        }
    },

    'ajustes': {
        'ajustes': {
            panelLabel: 'Ajustes Razonables',
            displayType: 'table',
            columns: [
                { key: 'desde', label: 'Desde' },
                { key: 'ajuste', label: 'Ajuste' },
                { key: 'siNo', label: 'Sí/No' },
                { key: 'comoHacerlo', label: '¿Cómo hacerlo?' }
            ]
        }
    },

    'rap-rac': {
        'rap': {
            panelLabel: 'Resultados de aprendizaje del Programa (RAP)',
            displayType: 'fields',
            fields: {
                'resultados': 'Resultados'
            }
        },
        'rac': {
            panelLabel: 'Resultados de aprendizaje del curso (RAC)',
            displayType: 'fields',
            fields: {
                'compromiso': 'Compromiso o valoración',
                'humanas': 'Dimensiones humanas del aprendizaje',
                'conocimiento': 'Conocimiento Fundamental',
                'aplicacion': 'Aplicación del aprendizaje',
                'integracion': 'Integración',
                'aprender': 'Aprender a aprender'
            }
        }
    },

    'actividades': {
        'Compromiso o valoración': {
            panelLabel: 'Compromiso o valoración',
            displayType: 'fields',
            fields: {
                'resultado': 'Resultado de aprendizaje',
                'metodologia': 'Metodología',
                'descripcion': 'Descripción de las actividades'
            }
        },
        'Dimensiones humanas del aprendizaje': {
            panelLabel: 'Dimensiones humanas del aprendizaje',
            displayType: 'fields',
            fields: {
                'resultado': 'Resultado de aprendizaje',
                'metodologia': 'Metodología',
                'descripcion': 'Descripción de las actividades'
            }
        },
        'Conocimiento Fundamental': {
            panelLabel: 'Conocimiento Fundamental',
            displayType: 'fields',
            fields: {
                'resultado': 'Resultado de aprendizaje',
                'metodologia': 'Metodología',
                'descripcion': 'Descripción de las actividades'
            }
        },
        'Aplicación del aprendizaje': {
            panelLabel: 'Aplicación del aprendizaje',
            displayType: 'fields',
            fields: {
                'resultado': 'Resultado de aprendizaje',
                'metodologia': 'Metodología',
                'descripcion': 'Descripción de las actividades'
            }
        },
        'Integración': {
            panelLabel: 'Integración',
            displayType: 'fields',
            fields: {
                'resultado': 'Resultado de aprendizaje',
                'metodologia': 'Metodología',
                'descripcion': 'Descripción de las actividades'
            }
        },
        'Aprender a aprender': {
            panelLabel: 'Aprender a aprender',
            displayType: 'fields',
            fields: {
                'resultado': 'Resultado de aprendizaje',
                'metodologia': 'Metodología',
                'descripcion': 'Descripción de las actividades'
            }
        }
    },

    'evaluacion': {
        'programa': {
            panelLabel: 'Programa',
            displayType: 'fields',
            fields: {
                'programaSeleccionado': '¿Tu asignatura es de pregrado o posgrado?'
            }
        },
        'Compromiso o valoración': {
            panelLabel: 'Compromiso o valoración',
            displayType: 'fields',
            fields: {
                'medios': 'Medios de evaluación',
                'otroMedioTexto': 'Otro medio',
                'tecnicas': 'Técnicas',
                'otraTecnicaTexto': 'Otra técnica',
                'instrumentos': 'Instrumentos',
                'otroInstrumentoTexto': 'Otro instrumento',
                'tipoEvaluacion': 'Tipo de evaluación',
                'otroTipoEvaluacionTexto': 'Otro tipo',
                'participantes': 'Participantes',
                'otrosParticipantesTexto': 'Otros participantes',
                'momento': 'Momento'
            }
        },
        'Dimensiones humanas del aprendizaje': {
            panelLabel: 'Dimensiones humanas del aprendizaje',
            displayType: 'fields',
            fields: {
                'medios': 'Medios de evaluación',
                'otroMedioTexto': 'Otro medio',
                'tecnicas': 'Técnicas',
                'otraTecnicaTexto': 'Otra técnica',
                'instrumentos': 'Instrumentos',
                'otroInstrumentoTexto': 'Otro instrumento',
                'tipoEvaluacion': 'Tipo de evaluación',
                'otroTipoEvaluacionTexto': 'Otro tipo',
                'participantes': 'Participantes',
                'otrosParticipantesTexto': 'Otros participantes',
                'momento': 'Momento'
            }
        },
        'Conocimiento Fundamental': {
            panelLabel: 'Conocimiento Fundamental',
            displayType: 'fields',
            fields: {
                'medios': 'Medios de evaluación',
                'otroMedioTexto': 'Otro medio',
                'tecnicas': 'Técnicas',
                'otraTecnicaTexto': 'Otra técnica',
                'instrumentos': 'Instrumentos',
                'otroInstrumentoTexto': 'Otro instrumento',
                'tipoEvaluacion': 'Tipo de evaluación',
                'otroTipoEvaluacionTexto': 'Otro tipo',
                'participantes': 'Participantes',
                'otrosParticipantesTexto': 'Otros participantes',
                'momento': 'Momento'
            }
        },
        'Aplicación del aprendizaje': {
            panelLabel: 'Aplicación del aprendizaje',
            displayType: 'fields',
            fields: {
                'medios': 'Medios de evaluación',
                'otroMedioTexto': 'Otro medio',
                'tecnicas': 'Técnicas',
                'otraTecnicaTexto': 'Otra técnica',
                'instrumentos': 'Instrumentos',
                'otroInstrumentoTexto': 'Otro instrumento',
                'tipoEvaluacion': 'Tipo de evaluación',
                'otroTipoEvaluacionTexto': 'Otro tipo',
                'participantes': 'Participantes',
                'otrosParticipantesTexto': 'Otros participantes',
                'momento': 'Momento'
            }
        },
        'Integración': {
            panelLabel: 'Integración',
            displayType: 'fields',
            fields: {
                'medios': 'Medios de evaluación',
                'otroMedioTexto': 'Otro medio',
                'tecnicas': 'Técnicas',
                'otraTecnicaTexto': 'Otra técnica',
                'instrumentos': 'Instrumentos',
                'otroInstrumentoTexto': 'Otro instrumento',
                'tipoEvaluacion': 'Tipo de evaluación',
                'otroTipoEvaluacionTexto': 'Otro tipo',
                'participantes': 'Participantes',
                'otrosParticipantesTexto': 'Otros participantes',
                'momento': 'Momento'
            }
        },
        'Aprender a aprender': {
            panelLabel: 'Aprender a aprender',
            displayType: 'fields',
            fields: {
                'medios': 'Medios de evaluación',
                'otroMedioTexto': 'Otro medio',
                'tecnicas': 'Técnicas',
                'otraTecnicaTexto': 'Otra técnica',
                'instrumentos': 'Instrumentos',
                'otroInstrumentoTexto': 'Otro instrumento',
                'tipoEvaluacion': 'Tipo de evaluación',
                'otroTipoEvaluacionTexto': 'Otro tipo',
                'participantes': 'Participantes',
                'otrosParticipantesTexto': 'Otros participantes',
                'momento': 'Momento'
            }
        },
        'Definición de los criterios de evaluación': {
            panelLabel: 'Definición de los criterios de evaluación',
            displayType: 'fields',
            fields: {
                'criterio_0': '¿Son observables y medibles?',
                'criterio_1': '¿Son pertinentes?',
                'criterio_2': '¿Tengo un plan de socialización con mis estudiantes?'
            }
        },
        'Selección de los instrumentos de evaluación': {
            panelLabel: 'Selección de los instrumentos de evaluación',
            displayType: 'fields',
            fields: {
                'criterio_0': '¿Están alineados con el resultado y la dimensión del aprendizaje?',
                'criterio_1': '¿Son variados y consideran los estilos de aprendizaje?',
                'criterio_2': '¿Establecen niveles de desempeño claros para los estudiantes?'
            }
        },
        'Participantes': {
            panelLabel: 'Participantes',
            displayType: 'fields',
            fields: {
                'criterio_0': '¿Existen actividades de auto, hetero y coevaluación con instrumentos específicos?'
            }
        },
        'Diálogo para la retroalimentación': {
            panelLabel: 'Diálogo para la retroalimentación',
            displayType: 'fields',
            fields: {
                'criterio_0': '¿He planeado y socializado los momentos de retroalimentación?',
                'criterio_1': '¿Se combinan la evaluación formativa con la sumativa?'
            }
        },
        'Calificación final (Numérica)': {
            panelLabel: 'Calificación final (Numérica)',
            displayType: 'fields',
            fields: {
                'criterio_0': '¿Refleja el alcance de los resultados de aprendizaje?',
                'criterio_1': '¿Corresponde a la escala institucional?',
                'criterio_2': '¿Es flexible y contempla diferentes métodos de calificación?'
            }
        }
    },

    'secuencia': {
        'secuenciaCurso': {
            panelLabel: 'Secuencia del curso',
            displayType: 'table',
            columns: [
                { key: 'modulo', label: 'Módulos / Temas' },
                { key: 'actividades', label: 'Actividades' },
                { key: 'descripcion', label: 'Descripción' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'horas', label: 'Horas' }
            ]
        }
    },

    'bibliografia': {
        'bibliografia': {
            panelLabel: 'Bibliografía',
            displayType: 'table',
            columns: [
                { key: 'autor', label: 'Autor(es)' },
                { key: 'titulo', label: 'Título' },
                { key: 'year', label: 'Año' },
                { key: 'editorial', label: 'Editorial' },
                { key: 'url', label: 'URL' }
            ]
        }
    }
};
