import { Ionicons } from '@expo/vector-icons';

export type Article = {
  id: string;
  name: string;
  number?: string;
  questions: number;
};

export type Subtopic = {
  id: string;
  name: string;
  description?: string;
  questions: number;
  articles: Article[];
};

export type Topic = {
  id: string;
  name: string;
  questions: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtopics: Subtopic[];
};

function st(
  topicId: string,
  n: number,
  name: string,
  description?: string,
): Subtopic {
  return {
    id: `${topicId}-${n}`,
    name,
    description,
    questions: 0,
    articles: [],
  };
}

/**
 * IDs alineados con el Excel / importador (Código Tema):
 * T1 … T25 (+ psico).
 */
export const TOPICS: Topic[] = [
  {
    id: 'T1',
    name: 'TEMA 1.- DERECHOS HUMANOS',
    questions: 0,
    icon: 'people',
    color: '#60A5FA',
    subtopics: [
      st('T1', 1, 'Carta de las Naciones Unidas y órganos'),
      st('T1', 2, 'Declaración Universal de Derechos Humanos'),
      st('T1', 3, 'Convenio europeo de derechos humanos y TEDH'),
      st('T1', 4, 'Carta Social Europea'),
      st('T1', 5, 'Pacto Internacional de Derechos Económicos, Sociales y Culturales'),
      st('T1', 6, 'Pacto Internacional de Derechos Civiles y Políticos'),
      st('T1', 7, 'Consejo de Derechos Humanos de la ONU'),
      st('T1', 8, 'Convención contra la tortura'),
      st('T1', 9, 'Protocolo facultativo de la Convención contra la tortura'),
      st('T1', 10, 'Carta de los Derechos Fundamentales de la UE'),
      st('T1', 11, 'Estatuto de Roma y Corte Penal Internacional'),
      st('T1', 12, 'LO 18/2003 de Cooperación con la CPI'),
      st('T1', 13, 'Reglamento del Defensor del Pueblo (1983)'),
    ],
  },
  {
    id: 'T2',
    name: 'TEMA 2.- IGUALDAD EFECTIVA DE MUJERES Y HOMBRES',
    questions: 0,
    icon: 'male-female',
    color: '#F472B6',
    subtopics: [
      st('T2', 1, 'LO 3/2007 — Visión general'),
      st('T2', 2, 'Título I — Principio de igualdad y tutela'),
      st('T2', 3, 'Título II — Políticas públicas para la igualdad'),
      st('T2', 4, 'Título III — Igualdad y medios de comunicación'),
      st('T2', 5, 'Título IV — Derecho al trabajo en igualdad'),
      st('T2', 6, 'Título V — Igualdad en el empleo público'),
      st('T2', 7, 'Título VI — Acceso a bienes y servicios'),
      st('T2', 8, 'Título VIII — Disposiciones organizativas'),
    ],
  },
  {
    id: 'T3',
    name: 'TEMA 3.- PREVENCIÓN DE RIESGOS LABORALES',
    questions: 0,
    icon: 'warning',
    color: '#FBBF24',
    subtopics: [
      st('T3', 1, 'Ley 31/1995 — Objeto, ámbito y definiciones'),
      st('T3', 2, 'Cap. II — Política de prevención'),
      st('T3', 3, 'Cap. III — Derechos y obligaciones'),
      st('T3', 4, 'Cap. VI — Fabricantes, importadores y suministradores'),
      st('T3', 5, 'Cap. VII — Responsabilidades y sanciones'),
      st('T3', 6, 'RD 67/2010 — Adaptación a la AGE'),
      st('T3', 7, 'RD 179/2005 — PRL en la Guardia Civil'),
    ],
  },
  {
    id: 'T4',
    name: 'TEMA 4.- DERECHO CONSTITUCIONAL',
    questions: 0,
    icon: 'business',
    color: '#38BDF8',
    subtopics: [
      st('T4', 1, 'Constitución Española de 1978'),
      st('T4', 2, 'LO 3/1981 Defensor del Pueblo — Nombramiento y cese'),
      st('T4', 3, 'LO 3/1981 — Procedimiento'),
      st('T4', 4, 'LO 3/1981 — Resoluciones y MNP Tortura'),
      st('T4', 5, 'LO 1/1982 — Honor, intimidad e imagen'),
    ],
  },
  {
    id: 'T5',
    name: 'TEMA 5.- DERECHO DE LA UNIÓN EUROPEA',
    questions: 0,
    icon: 'globe',
    color: '#818CF8',
    subtopics: [
      st('T5', 1, 'TUE — Disposiciones comunes y principios democráticos'),
      st('T5', 2, 'TUE — Instituciones y cooperaciones reforzadas'),
      st('T5', 3, 'TUE — Acción exterior y PESC / PCSD'),
      st('T5', 4, 'TFUE — Principios, no discriminación y ciudadanía'),
      st('T5', 5, 'TFUE — Mercado interior y libertades'),
      st('T5', 6, 'TFUE — Espacio de libertad, seguridad y justicia'),
      st('T5', 7, 'TFUE — Medio ambiente y Protección Civil'),
      st('T5', 8, 'TFUE — Acción exterior y cláusula de solidaridad'),
      st('T5', 9, 'TFUE — Instituciones (PE, Consejo, Comisión, TJUE)'),
      st('T5', 10, 'TFUE — Actos jurídicos y órganos consultivos'),
    ],
  },
  {
    id: 'T6',
    name: 'TEMA 6.- INSTITUCIONES INTERNACIONALES',
    questions: 0,
    icon: 'earth',
    color: '#2DD4BF',
    subtopics: [
      st('T6', 1, 'ONU'),
      st('T6', 2, 'Consejo de Europa'),
      st('T6', 3, 'Unión Europea'),
      st('T6', 4, 'OTAN / NATO'),
      st('T6', 5, 'INTERPOL'),
      st('T6', 6, 'EUROPOL'),
      st('T6', 7, 'EUROJUST'),
      st('T6', 8, 'FRONTEX'),
      st('T6', 9, 'CEPOL'),
      st('T6', 10, 'FAO, FMI y OMS'),
    ],
  },
  {
    id: 'T7',
    name: 'TEMA 7.- DERECHO CIVIL',
    questions: 0,
    icon: 'document-text',
    color: '#A78BFA',
    subtopics: [
      st('T7', 1, 'Código Civil — Título Preliminar'),
      st('T7', 2, 'Libro I — De las Personas (Títulos I a XII)'),
    ],
  },
  {
    id: 'T8',
    name: 'TEMA 8.- DERECHO PENAL',
    questions: 0,
    icon: 'scale',
    color: '#C084FC',
    subtopics: [
      st('T8', 1, 'Código Penal — Título Preliminar'),
      st('T8', 2, 'Libro I — Infracción penal'),
      st('T8', 3, 'Libro I — Personas responsables'),
      st('T8', 4, 'Libro I — Penas'),
      st('T8', 5, 'Libro I — Medidas de seguridad'),
      st('T8', 6, 'Libro I — Responsabilidad civil'),
      st('T8', 7, 'Libro I — Extinción de la responsabilidad criminal'),
      st('T8', 8, 'Libro II — Homicidio y lesiones'),
      st('T8', 9, 'Libro II — Libertad, torturas e integridad moral'),
      st('T8', 10, 'Libro II — Trata de seres humanos'),
      st('T8', 11, 'Libro II — Libertad e indemnidad sexuales'),
      st('T8', 12, 'Libro II — Relaciones familiares'),
      st('T8', 13, 'Libro II — Administración Pública'),
      st('T8', 14, 'Libro II — Constitución y Comunidad Internacional'),
    ],
  },
  {
    id: 'T9',
    name: 'TEMA 9.- DERECHO PROCESAL PENAL',
    questions: 0,
    icon: 'hammer',
    color: '#FB923C',
    subtopics: [
      st('T9', 1, 'LECrim — Competencia y acciones penales'),
      st('T9', 2, 'LECrim — Defensa y asistencia jurídica'),
      st('T9', 3, 'LECrim — Denuncia, querella y Policía Judicial'),
      st('T9', 4, 'LECrim — Instrucción y comprobación del delito'),
      st('T9', 5, 'LECrim — Detención y prisión provisional'),
      st('T9', 6, 'LECrim — Entrada, registro y correspondencia'),
      st('T9', 7, 'LO 6/1984 — Habeas Corpus'),
      st('T9', 8, 'LOPJ — Órganos, Fiscal y Policía Judicial'),
      st('T9', 9, 'RD 769/1987 — Policía Judicial'),
      st('T9', 10, 'Ley 4/2015 — Estatuto de la víctima'),
    ],
  },
  {
    id: 'T10',
    name: 'TEMA 10.- DERECHO ADMINISTRATIVO',
    questions: 0,
    icon: 'briefcase',
    color: '#34D399',
    subtopics: [
      st('T10', 1, 'Ley 39/2015 — Disposiciones generales e interesados'),
      st('T10', 2, 'Ley 39/2015 — Actividad de las AA.PP.'),
      st('T10', 3, 'Ley 39/2015 — Actos administrativos'),
      st('T10', 4, 'Ley 39/2015 — Procedimiento administrativo común'),
      st('T10', 5, 'Ley 39/2015 — Revisión y recursos'),
      st('T10', 6, 'Ley 39/2015 — Iniciativa legislativa y reglamentos'),
      st('T10', 7, 'Ley 40/2015 — Principios y AGE'),
      st('T10', 8, 'Ley 40/2015 — Relaciones interadministrativas'),
    ],
  },
  {
    id: 'T11',
    name: 'TEMA 11.- PROTECCIÓN DE DATOS',
    questions: 0,
    icon: 'lock-closed',
    color: '#22D3EE',
    subtopics: [
      st('T11', 1, 'LO 3/2018 — Títulos I a IV'),
      st('T11', 2, 'LO 3/2018 — Títulos V a VIII'),
    ],
  },
  {
    id: 'T12',
    name: 'TEMA 12.- EXTRANJERÍA. INMIGRACIÓN',
    questions: 0,
    icon: 'airplane',
    color: '#4ADE80',
    subtopics: [
      st('T12', 1, 'LO 4/2000 — Derechos y libertades de extranjeros'),
      st('T12', 2, 'RD 240/2007 — Ciudadanos UE y EEE'),
    ],
  },
  {
    id: 'T13',
    name: 'TEMA 13.- SEGURIDAD PÚBLICA Y SEGURIDAD PRIVADA',
    questions: 0,
    icon: 'shield',
    color: '#F87171',
    subtopics: [
      st('T13', 1, 'LO 4/2015 — Disposiciones generales e identificación'),
      st('T13', 2, 'LO 4/2015 — Mantenimiento de la seguridad ciudadana'),
      st('T13', 3, 'LO 4/2015 — Policía administrativa y sanciones'),
      st('T13', 4, 'Ley 5/2014 — Seguridad privada (general y coordinación)'),
      st('T13', 5, 'Ley 5/2014 — Empresas y personal de seguridad'),
      st('T13', 6, 'Ley 5/2014 — Servicios, medidas y control'),
    ],
  },
  {
    id: 'T14',
    name: 'TEMA 14.- MINISTERIO DEL INTERIOR. MINISTERIO DE DEFENSA',
    questions: 0,
    icon: 'flag',
    color: '#EAB308',
    subtopics: [
      st('T14', 1, 'Estructura orgánica del Ministerio del Interior'),
      st('T14', 2, 'Estructura orgánica del Ministerio de Defensa'),
    ],
  },
  {
    id: 'T15',
    name: 'TEMA 15.- FUERZAS Y CUERPOS DE SEGURIDAD. GUARDIA CIVIL',
    questions: 0,
    icon: 'shield-checkmark',
    color: '#4ADE80',
    subtopics: [
      st('T15', 1, 'LO 2/1986 — Fuerzas y Cuerpos de Seguridad'),
      st('T15', 2, 'LO 29/2014 — Régimen de personal de la GC'),
      st('T15', 3, 'Servicios Centrales de la DGGC'),
      st('T15', 4, 'Historia de la Guardia Civil'),
      st('T15', 5, 'LO 11/2007 — Derechos y deberes de la GC'),
    ],
  },
  {
    id: 'T16',
    name: 'TEMA 16.- PROTECCIÓN CIVIL. DESARROLLO SOSTENIBLE. EFICIENCIA ENERGÉTICA',
    questions: 0,
    icon: 'leaf',
    color: '#A3E635',
    subtopics: [
      st('T16', 1, 'Ley 17/2015 — Sistema Nacional de Protección Civil'),
      st('T16', 2, 'Ley 42/2007 — Patrimonio natural y biodiversidad'),
      st('T16', 3, 'Directiva 2012/27/UE — Eficiencia energética'),
    ],
  },
  {
    id: 'T17',
    name: 'TEMA 17.- TECNOLOGÍAS DE LA INFORMACIÓN Y LA COMUNICACIÓN',
    questions: 0,
    icon: 'laptop',
    color: '#38BDF8',
    subtopics: [
      st('T17', 1, 'Ley 9/2014 — General de Telecomunicaciones'),
      st('T17', 2, 'RD 806/2014 — TIC en la AGE'),
      st('T17', 3, 'Criptografía y firma digital — Ley 6/2020'),
      st('T17', 4, 'Ciberseguridad CCN-CERT'),
      st('T17', 5, 'RD 4/2010 — Esquema Nacional de Interoperabilidad'),
    ],
  },
  {
    id: 'T18',
    name: 'TEMA 18.- TOPOGRAFÍA',
    questions: 0,
    icon: 'map',
    color: '#2DD4BF',
    subtopics: [
      st('T18', 1, 'Elementos geográficos y coordenadas'),
      st('T18', 2, 'Unidades de medida y escalas'),
      st('T18', 3, 'Representación del terreno (planimetría y altimetría)'),
    ],
  },
  {
    id: 'T19',
    name: 'TEMA 19.- DEONTOLOGÍA PROFESIONAL',
    questions: 0,
    icon: 'ribbon',
    color: '#F472B6',
    subtopics: [
      st('T19', 1, 'Principios ONU sobre uso de la fuerza y armas de fuego'),
      st('T19', 2, 'RD 176/2022 — Código de conducta de la GC'),
    ],
  },
  {
    id: 'T20',
    name: 'TEMA 20.- RESPONSABILIDAD PENAL DE LOS MENORES',
    questions: 0,
    icon: 'happy',
    color: '#2DD4BF',
    subtopics: [
      st('T20', 1, 'LO 5/2000 — Responsabilidad penal de los menores'),
    ],
  },
  {
    id: 'T21',
    name: 'TEMA 21.- PROTECCIÓN INTEGRAL CONTRA LA VIOLENCIA DE GÉNERO',
    questions: 0,
    icon: 'heart',
    color: '#F43F5E',
    subtopics: [
      st('T21', 1, 'LO 1/2004 — Protección integral contra la violencia de género'),
    ],
  },
  {
    id: 'T22',
    name: 'TEMA 22.- ARMAS Y EXPLOSIVOS',
    questions: 0,
    icon: 'flash',
    color: '#F59E0B',
    subtopics: [
      st('T22', 1, 'RD 137/1993 — Reglamento de Armas'),
      st('T22', 2, 'RD 130/2017 — Reglamento de Explosivos'),
    ],
  },
  {
    id: 'T23',
    name: 'TEMA 23.- DERECHO FISCAL',
    questions: 0,
    icon: 'cube',
    color: '#94A3B8',
    subtopics: [
      st('T23', 1, 'LO 12/1995 — Represión del contrabando'),
      st('T23', 2, 'RD 1649/1998 — Infracciones administrativas de contrabando'),
      st('T23', 3, 'Código Aduanero de la Unión — Disposiciones generales'),
      st('T23', 4, 'Código Aduanero — Valor en aduana y deuda'),
      st('T23', 5, 'Código Aduanero — Libre práctica y regímenes especiales'),
      st('T23', 6, 'Código Aduanero — Salida y exportación'),
    ],
  },
  {
    id: 'T24',
    name: 'TEMA 24.- INGLÉS',
    questions: 0,
    icon: 'language',
    color: '#60A5FA',
    subtopics: [
      st('T24', 1, 'Vocabulario general'),
      st('T24', 2, 'Gramática'),
      st('T24', 3, 'Comprensión lectora'),
      st('T24', 4, 'Inglés policial / institucional'),
    ],
  },
  {
    id: 'T25',
    name: 'TEMA 25.- LENGUA ESPAÑOLA',
    questions: 0,
    icon: 'text',
    color: '#A78BFA',
    subtopics: [
      st('T25', 1, 'Prueba de ortografía'),
      st('T25', 2, 'Prueba de gramática'),
    ],
  },
  {
    id: 'psico',
    name: 'Psicotécnicos / Pruebas de aptitud intelectual',
    questions: 0,
    icon: 'bulb',
    color: '#FBBF24',
    subtopics: [
      st('psico', 1, 'Razonamiento verbal'),
      st('psico', 2, 'Razonamiento numérico'),
      st('psico', 3, 'Razonamiento abstracto'),
      st('psico', 4, 'Atención y percepción'),
    ],
  },
];

export function getTopicById(id: string) {
  return TOPICS.find((t) => t.id === id);
}