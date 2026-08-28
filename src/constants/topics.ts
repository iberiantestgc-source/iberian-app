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

export const TOPICS: Topic[] = [
  {
    id: 'ddhh',
    name: 'TEMA 1.- DERECHOS HUMANOS',
    questions: 0,
    icon: 'people',
    color: '#60A5FA',
    subtopics: [
      st('ddhh', 1, 'Carta de las Naciones Unidas y órganos'),
      st('ddhh', 2, 'Declaración Universal de Derechos Humanos'),
      st('ddhh', 3, 'Convenio europeo de derechos humanos y TEDH'),
      st('ddhh', 4, 'Carta Social Europea'),
      st('ddhh', 5, 'Pacto Internacional de Derechos Económicos, Sociales y Culturales'),
      st('ddhh', 6, 'Pacto Internacional de Derechos Civiles y Políticos'),
      st('ddhh', 7, 'Consejo de Derechos Humanos de la ONU'),
      st('ddhh', 8, 'Convención contra la tortura'),
      st('ddhh', 9, 'Protocolo facultativo de la Convención contra la tortura'),
      st('ddhh', 10, 'Carta de los Derechos Fundamentales de la UE'),
      st('ddhh', 11, 'Estatuto de Roma y Corte Penal Internacional'),
      st('ddhh', 12, 'LO 18/2003 de Cooperación con la CPI'),
      st('ddhh', 13, 'Reglamento del Defensor del Pueblo (1983)'),
    ],
  },
  {
    id: 'igualdad',
    name: 'TEMA 2.- IGUALDAD EFECTIVA DE MUJERES Y HOMBRES',
    questions: 0,
    icon: 'male-female',
    color: '#F472B6',
    subtopics: [
      st('igualdad', 1, 'LO 3/2007 — Visión general'),
      st('igualdad', 2, 'Título I — Principio de igualdad y tutela'),
      st('igualdad', 3, 'Título II — Políticas públicas para la igualdad'),
      st('igualdad', 4, 'Título III — Igualdad y medios de comunicación'),
      st('igualdad', 5, 'Título IV — Derecho al trabajo en igualdad'),
      st('igualdad', 6, 'Título V — Igualdad en el empleo público'),
      st('igualdad', 7, 'Título VI — Acceso a bienes y servicios'),
      st('igualdad', 8, 'Título VIII — Disposiciones organizativas'),
    ],
  },
  {
    id: 'prl',
    name: 'TEMA 3.- PREVENCIÓN DE RIESGOS LABORALES',
    questions: 0,
    icon: 'warning',
    color: '#FBBF24',
    subtopics: [
      st('prl', 1, 'Ley 31/1995 — Objeto, ámbito y definiciones'),
      st('prl', 2, 'Cap. II — Política de prevención'),
      st('prl', 3, 'Cap. III — Derechos y obligaciones'),
      st('prl', 4, 'Cap. VI — Fabricantes, importadores y suministradores'),
      st('prl', 5, 'Cap. VII — Responsabilidades y sanciones'),
      st('prl', 6, 'RD 67/2010 — Adaptación a la AGE'),
      st('prl', 7, 'RD 179/2005 — PRL en la Guardia Civil'),
    ],
  },
  {
    id: 'const',
    name: 'TEMA 4.- DERECHO CONSTITUCIONAL',
    questions: 0,
    icon: 'business',
    color: '#38BDF8',
    subtopics: [
      st('const', 1, 'Constitución Española de 1978'),
      st('const', 2, 'LO 3/1981 Defensor del Pueblo — Nombramiento y cese'),
      st('const', 3, 'LO 3/1981 — Procedimiento'),
      st('const', 4, 'LO 3/1981 — Resoluciones y MNP Tortura'),
      st('const', 5, 'LO 1/1982 — Honor, intimidad e imagen'),
    ],
  },
  {
    id: 'ue',
    name: 'TEMA 5.- DERECHO DE LA UNIÓN EUROPEA',
    questions: 0,
    icon: 'globe',
    color: '#818CF8',
    subtopics: [
      st('ue', 1, 'TUE — Disposiciones comunes y principios democráticos'),
      st('ue', 2, 'TUE — Instituciones y cooperaciones reforzadas'),
      st('ue', 3, 'TUE — Acción exterior y PESC / PCSD'),
      st('ue', 4, 'TFUE — Principios, no discriminación y ciudadanía'),
      st('ue', 5, 'TFUE — Mercado interior y libertades'),
      st('ue', 6, 'TFUE — Espacio de libertad, seguridad y justicia'),
      st('ue', 7, 'TFUE — Medio ambiente y Protección Civil'),
      st('ue', 8, 'TFUE — Acción exterior y cláusula de solidaridad'),
      st('ue', 9, 'TFUE — Instituciones (PE, Consejo, Comisión, TJUE)'),
      st('ue', 10, 'TFUE — Actos jurídicos y órganos consultivos'),
    ],
  },
  {
    id: 'ii',
    name: 'TEMA 6.- INSTITUCIONES INTERNACIONALES',
    questions: 0,
    icon: 'earth',
    color: '#2DD4BF',
    subtopics: [
      st('ii', 1, 'ONU'),
      st('ii', 2, 'Consejo de Europa'),
      st('ii', 3, 'Unión Europea'),
      st('ii', 4, 'OTAN / NATO'),
      st('ii', 5, 'INTERPOL'),
      st('ii', 6, 'EUROPOL'),
      st('ii', 7, 'EUROJUST'),
      st('ii', 8, 'FRONTEX'),
      st('ii', 9, 'CEPOL'),
      st('ii', 10, 'FAO, FMI y OMS'),
    ],
  },
  {
    id: 'civil',
    name: 'TEMA 7.- DERECHO CIVIL',
    questions: 0,
    icon: 'document-text',
    color: '#A78BFA',
    subtopics: [
      st('civil', 1, 'Código Civil — Título Preliminar'),
      st('civil', 2, 'Libro I — De las Personas (Títulos I a XII)'),
    ],
  },
  {
    id: 'penal',
    name: 'TEMA 8.- DERECHO PENAL',
    questions: 0,
    icon: 'scale',
    color: '#C084FC',
    subtopics: [
      st('penal', 1, 'Código Penal — Título Preliminar'),
      st('penal', 2, 'Libro I — Infracción penal'),
      st('penal', 3, 'Libro I — Personas responsables'),
      st('penal', 4, 'Libro I — Penas'),
      st('penal', 5, 'Libro I — Medidas de seguridad'),
      st('penal', 6, 'Libro I — Responsabilidad civil'),
      st('penal', 7, 'Libro I — Extinción de la responsabilidad criminal'),
      st('penal', 8, 'Libro II — Homicidio y lesiones'),
      st('penal', 9, 'Libro II — Libertad, torturas e integridad moral'),
      st('penal', 10, 'Libro II — Trata de seres humanos'),
      st('penal', 11, 'Libro II — Libertad e indemnidad sexuales'),
      st('penal', 12, 'Libro II — Relaciones familiares'),
      st('penal', 13, 'Libro II — Administración Pública'),
      st('penal', 14, 'Libro II — Constitución y Comunidad Internacional'),
    ],
  },
  {
    id: 'proc',
    name: 'TEMA 9.- DERECHO PROCESAL PENAL',
    questions: 0,
    icon: 'hammer',
    color: '#FB923C',
    subtopics: [
      st('proc', 1, 'LECrim — Competencia y acciones penales'),
      st('proc', 2, 'LECrim — Defensa y asistencia jurídica'),
      st('proc', 3, 'LECrim — Denuncia, querella y Policía Judicial'),
      st('proc', 4, 'LECrim — Instrucción y comprobación del delito'),
      st('proc', 5, 'LECrim — Detención y prisión provisional'),
      st('proc', 6, 'LECrim — Entrada, registro y correspondencia'),
      st('proc', 7, 'LO 6/1984 — Habeas Corpus'),
      st('proc', 8, 'LOPJ — Órganos, Fiscal y Policía Judicial'),
      st('proc', 9, 'RD 769/1987 — Policía Judicial'),
      st('proc', 10, 'Ley 4/2015 — Estatuto de la víctima'),
    ],
  },
  {
    id: 'admin',
    name: 'TEMA 10.- DERECHO ADMINISTRATIVO',
    questions: 0,
    icon: 'briefcase',
    color: '#34D399',
    subtopics: [
      st('admin', 1, 'Ley 39/2015 — Disposiciones generales e interesados'),
      st('admin', 2, 'Ley 39/2015 — Actividad de las AA.PP.'),
      st('admin', 3, 'Ley 39/2015 — Actos administrativos'),
      st('admin', 4, 'Ley 39/2015 — Procedimiento administrativo común'),
      st('admin', 5, 'Ley 39/2015 — Revisión y recursos'),
      st('admin', 6, 'Ley 39/2015 — Iniciativa legislativa y reglamentos'),
      st('admin', 7, 'Ley 40/2015 — Principios y AGE'),
      st('admin', 8, 'Ley 40/2015 — Relaciones interadministrativas'),
    ],
  },
  {
    id: 'lopd',
    name: 'TEMA 11.- PROTECCIÓN DE DATOS',
    questions: 0,
    icon: 'lock-closed',
    color: '#22D3EE',
    subtopics: [
      st('lopd', 1, 'LO 3/2018 — Títulos I a IV'),
      st('lopd', 2, 'LO 3/2018 — Títulos V a VIII'),
    ],
  },
  {
    id: 'ext',
    name: 'TEMA 12.- EXTRANJERÍA. INMIGRACIÓN',
    questions: 0,
    icon: 'airplane',
    color: '#4ADE80',
    subtopics: [
      st('ext', 1, 'LO 4/2000 — Derechos y libertades de extranjeros'),
      st('ext', 2, 'RD 240/2007 — Ciudadanos UE y EEE'),
    ],
  },
  {
    id: 'sp',
    name: 'TEMA 13.- SEGURIDAD PÚBLICA Y SEGURIDAD PRIVADA',
    questions: 0,
    icon: 'shield',
    color: '#F87171',
    subtopics: [
      st('sp', 1, 'LO 4/2015 — Disposiciones generales e identificación'),
      st('sp', 2, 'LO 4/2015 — Mantenimiento de la seguridad ciudadana'),
      st('sp', 3, 'LO 4/2015 — Policía administrativa y sanciones'),
      st('sp', 4, 'Ley 5/2014 — Seguridad privada (general y coordinación)'),
      st('sp', 5, 'Ley 5/2014 — Empresas y personal de seguridad'),
      st('sp', 6, 'Ley 5/2014 — Servicios, medidas y control'),
    ],
  },
  {
    id: 'min',
    name: 'TEMA 14.- MINISTERIO DEL INTERIOR. MINISTERIO DE DEFENSA',
    questions: 0,
    icon: 'flag',
    color: '#EAB308',
    subtopics: [
      st('min', 1, 'Estructura orgánica del Ministerio del Interior'),
      st('min', 2, 'Estructura orgánica del Ministerio de Defensa'),
    ],
  },
  {
    id: 'fcs',
    name: 'TEMA 15.- FUERZAS Y CUERPOS DE SEGURIDAD. GUARDIA CIVIL',
    questions: 0,
    icon: 'shield-checkmark',
    color: '#4ADE80',
    subtopics: [
      st('fcs', 1, 'LO 2/1986 — Fuerzas y Cuerpos de Seguridad'),
      st('fcs', 2, 'LO 29/2014 — Régimen de personal de la GC'),
      st('fcs', 3, 'Servicios Centrales de la DGGC'),
      st('fcs', 4, 'Historia de la Guardia Civil'),
      st('fcs', 5, 'LO 11/2007 — Derechos y deberes de la GC'),
    ],
  },
  {
    id: 'socio',
    name: 'TEMA 16.- PROTECCIÓN CIVIL. DESARROLLO SOSTENIBLE. EFICIENCIA ENERGÉTICA',
    questions: 0,
    icon: 'leaf',
    color: '#A3E635',
    subtopics: [
      st('socio', 1, 'Ley 17/2015 — Sistema Nacional de Protección Civil'),
      st('socio', 2, 'Ley 42/2007 — Patrimonio natural y biodiversidad'),
      st('socio', 3, 'Directiva 2012/27/UE — Eficiencia energética'),
    ],
  },
  {
    id: 'tic',
    name: 'TEMA 17.- TECNOLOGÍAS DE LA INFORMACIÓN Y LA COMUNICACIÓN',
    questions: 0,
    icon: 'laptop',
    color: '#38BDF8',
    subtopics: [
      st('tic', 1, 'Ley 9/2014 — General de Telecomunicaciones'),
      st('tic', 2, 'RD 806/2014 — TIC en la AGE'),
      st('tic', 3, 'Criptografía y firma digital — Ley 6/2020'),
      st('tic', 4, 'Ciberseguridad CCN-CERT'),
      st('tic', 5, 'RD 4/2010 — Esquema Nacional de Interoperabilidad'),
    ],
  },
  {
    id: 'topo',
    name: 'TEMA 18.- TOPOGRAFÍA',
    questions: 0,
    icon: 'map',
    color: '#2DD4BF',
    subtopics: [
      st('topo', 1, 'Elementos geográficos y coordenadas'),
      st('topo', 2, 'Unidades de medida y escalas'),
      st('topo', 3, 'Representación del terreno (planimetría y altimetría)'),
    ],
  },
  {
    id: 'deon',
    name: 'TEMA 19.- DEONTOLOGÍA PROFESIONAL',
    questions: 0,
    icon: 'ribbon',
    color: '#F472B6',
    subtopics: [
      st('deon', 1, 'Principios ONU sobre uso de la fuerza y armas de fuego'),
      st('deon', 2, 'RD 176/2022 — Código de conducta de la GC'),
    ],
  },
  {
    id: 'menores',
    name: 'TEMA 20.- RESPONSABILIDAD PENAL DE LOS MENORES',
    questions: 0,
    icon: 'happy',
    color: '#2DD4BF',
    subtopics: [
      st('menores', 1, 'LO 5/2000 — Responsabilidad penal de los menores'),
    ],
  },
  {
    id: 'vg',
    name: 'TEMA 21.- PROTECCIÓN INTEGRAL CONTRA LA VIOLENCIA DE GÉNERO',
    questions: 0,
    icon: 'heart',
    color: '#F43F5E',
    subtopics: [
      st('vg', 1, 'LO 1/2004 — Protección integral contra la violencia de género'),
    ],
  },
  {
    id: 'armas',
    name: 'TEMA 22.- ARMAS Y EXPLOSIVOS',
    questions: 0,
    icon: 'flash',
    color: '#F59E0B',
    subtopics: [
      st('armas', 1, 'RD 137/1993 — Reglamento de Armas'),
      st('armas', 2, 'RD 130/2017 — Reglamento de Explosivos'),
    ],
  },
  {
    id: 'fiscal',
    name: 'TEMA 23.- DERECHO FISCAL',
    questions: 0,
    icon: 'cube',
    color: '#94A3B8',
    subtopics: [
      st('fiscal', 1, 'LO 12/1995 — Represión del contrabando'),
      st('fiscal', 2, 'RD 1649/1998 — Infracciones administrativas de contrabando'),
      st('fiscal', 3, 'Código Aduanero de la Unión — Disposiciones generales'),
      st('fiscal', 4, 'Código Aduanero — Valor en aduana y deuda'),
      st('fiscal', 5, 'Código Aduanero — Libre práctica y regímenes especiales'),
      st('fiscal', 6, 'Código Aduanero — Salida y exportación'),
    ],
  },
  {
    id: 'ingles',
    name: 'TEMA 24.- INGLÉS',
    questions: 0,
    icon: 'language',
    color: '#60A5FA',
    subtopics: [
      st('ingles', 1, 'Vocabulario general'),
      st('ingles', 2, 'Gramática'),
      st('ingles', 3, 'Comprensión lectora'),
      st('ingles', 4, 'Inglés policial / institucional'),
    ],
  },
  {
    id: 'orto',
    name: 'TEMA 25.- LENGUA ESPAÑOLA',
    questions: 0,
    icon: 'text',
    color: '#A78BFA',
    subtopics: [
      st('orto', 1, 'Prueba de ortografía'),
      st('orto', 2, 'Prueba de gramática'),
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