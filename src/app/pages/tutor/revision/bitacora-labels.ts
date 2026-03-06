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
    'debate': 'Debate / diálogo grupal',
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
    // Evaluacion - tipo
    'sumativa': 'Sumativa',
    'formativa': 'Formativa',
    'mixta': 'Mixta',
    // Evaluacion - actores
    'hetero': 'Heteroevaluación',
    'co': 'Coevaluación',
    'auto': 'Autoevaluación',
    // Evaluacion - momento
    'inicial': 'Inicial',
    'media': 'Media procesual',
    'final': 'Final',
    // Evaluacion - medios escritos
    'carpeta_dossier': 'Carpeta o dossier / carpeta colaborativa',
    'control_examen': 'Control (Examen)',
    'cuaderno': 'Cuaderno / cuaderno de notas / cuaderno de campo',
    'cuestionario': 'Cuestionario',
    'diario': 'Diario reflexivo / diario de clase',
    'estudio_casos': 'Estudio de casos',
    'ensayo': 'Ensayo',
    'examen': 'Examen',
    'foro_virtual': 'Foro virtual',
    'memoria': 'Memoria',
    'monografia': 'Monografía',
    'informe': 'Informe',
    'portafolio': 'Portafolio / portafolio electrónico',
    'poster': 'Póster',
    'pruebas_objetivas': 'Pruebas objetivas',
    'recension': 'Recensión',
    'test_diagnostico': 'Test diagnóstico',
    'trabajo_escrito': 'Trabajo escrito',
    // Evaluacion - medios orales
    'comunicacion_oral': 'Comunicación oral',
    'cuestionario_oral': 'Cuestionario oral',
    'discusion_grupal': 'Discusión grupal',
    'mesa_redonda': 'Mesa redonda',
    'ponencia': 'Ponencia',
    'pregunta_clase': 'Pregunta de clase',
    'presentacion_oral': 'Presentación oral',
    // Evaluacion - medios prácticos
    'practica_supervisada': 'Práctica supervisada',
    'demostracion': 'Demostración / actuación / representación',
    'role_playing': 'Role playing',
    // Evaluacion - técnicas
    'analisis_documental': 'Análisis documental',
    'analisis_producciones': 'Análisis de producciones',
    'observacion_directa': 'Observación directa del alumno',
    'observacion_grupo': 'Observación del grupo',
    'observacion_sistematica': 'Observación sistemática',
    'analisis_audio_video': 'Análisis de grabación de audio o video',
    'autoevaluacion': 'Autoevaluación',
    'coevaluacion': 'Evaluación entre pares',
    'evaluacion_colaborativa': 'Evaluación compartida o colaborativa',
    // Evaluacion - instrumentos
    'diario_profesor': 'Diario del profesor',
    'escala_comprobacion': 'Escala de comprobación',
    'escala_diferencial': 'Escala de diferencial semántico',
    'escala_verbal_numerica': 'Escala verbal o numérica',
    'escala_rubrica': 'Escala descriptiva o rúbrica',
    'escala_estimacion': 'Escala de estimación',
    'ficha_observacion': 'Ficha de observación',
    'lista_control': 'Lista de control',
    'matrices_decision': 'Matrices de decisión',
    'fichas_seguimiento': 'Fichas de seguimiento individual o grupal',
    'fichas_autoevaluacion': 'Fichas de autoevaluación',
    'fichas_entre_iguales': 'Fichas de evaluación entre iguales',
    'informe_expertos': 'Informe de expertos',
    'informe_autoevaluacion': 'Informe de autoevaluación',
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
        'justificacion': {
            panelLabel: 'Justificación',
            displayType: 'fields',
            fields: {
                'respuesta': 'Justificación'
            }
        }
    },

    'factores': {
        'ecosistema': {
            panelLabel: 'Ecosistema para el éxito académico',
            displayType: 'fields',
            fields: {
                'numEstudiantes': '¿Cuántos estudiantes toman tu curso?',
                'numDocentes': '¿Cuántos docentes desarrollan este curso?',
                'liderExito': '¿Cómo se llama el líder de Éxito estudiantil de tu programa?',
                'liderFortalecimiento': '¿Cómo se llama el líder de Fortalecimiento curricular de tu programa?',
                'unidadAdscrita': '¿A qué unidad académica está adscrito tu curso?',
                'unidadesDicta': '¿En qué unidades académicas se dicta este curso?',
                'aspectosImportantes': '¿Qué aspectos importantes deben tener en cuenta tus estudiantes para culminar con éxito este curso?'
            }
        },
        'resultadosAprendizaje': {
            panelLabel: 'Resultados de Aprendizaje',
            displayType: 'list',
            infoLabel: '¿Cuál o cuáles son los resultados de aprendizaje de tu curso?'
        },
        'contenidos': {
            panelLabel: 'Contenidos de la asignatura',
            displayType: 'table',
            columns: [
                { key: 'tema', label: 'Módulo/Unidad/Tema' },
                { key: 'subtema', label: 'Subtema' }
            ]
        },
        'panel1': {
            panelLabel: 'Contexto Específico de la situación de Enseñanza/Aprendizaje',
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
            panelLabel: '¿Cuáles son las característias de los estudiantes?',
            displayType: 'fields',
            fields: {
                'pregunta10': '10. ¿Cuáles son las características biopsicosociales, culturales, académicas y económicas de tus estudiantes?',
                'pregunta11': '11. ¿Qué conocimiento previo, experiencias y predisposiciones iniciales suelen tener los estudiantes sobre el tema?',
                'pregunta12': '12. ¿Cuáles son los estilos preferidos de aprendizaje de tus estudiantes?',
                'pregunta13': '13. ¿Conoces las características de diversidad de los estudiantes que integrarán tu curso?'
            }
        },
        'panel3': {
            panelLabel: '¿Cuáles son tus característias como docente?',
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
        'actividades': {
            panelLabel: 'Actividades de aprendizaje',
            displayType: 'table',
            columns: [
                { key: 'nombre', label: 'Nombre' },
                { key: 'ra', label: 'Resultado de Aprendizaje' },
                { key: 'tema', label: 'Tema' },
                { key: 'subtema', label: 'Subtema' },
                { key: 'dimension', label: 'Dimensión' },
                { key: 'metodologia', label: 'Metodología' },
                { key: 'descripcion', label: 'Descripción de la actividad' }
            ]
        }
    },

    'evaluacion': {
        'actividadesEvaluacion': {
            panelLabel: 'Diseño de la evaluación — Actividades',
            displayType: 'table',
            columns: [
                { key: 'nombre', label: 'Actividad' },
                { key: 'descripcionEvaluacion', label: 'Descripción de evaluación' },
                { key: 'tipoEvaluacion', label: 'Tipo de evaluación' },
                { key: 'momento', label: 'Momento' },
                { key: 'actores', label: 'Actores' },
                { key: 'medios', label: 'Medios' },
                { key: 'tecnicas', label: 'Técnicas' },
                { key: 'instrumentos', label: 'Instrumentos' }
            ]
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
