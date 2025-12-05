const BASE_DOCS_PATH = '../../../docs/microapps/educacao';
const EXAMS_INDEX_PATH = `${BASE_DOCS_PATH}/exams.json`;

const getExamDetailsPath = (year) => `${BASE_DOCS_PATH}/enem/public/${year}/details.json`;
const getQuestionDetailsPath = (year, slug) => `${BASE_DOCS_PATH}/enem/public/${year}/questions/${slug}/details.json`;

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Falha ao carregar ${path} (${response.status})`);
    }
    return response.json();
}

export async function fetchExams() {
    return fetchJson(EXAMS_INDEX_PATH);
}

function buildOptionLabel(alternative) {
    if (alternative.text) return alternative.text;
    if (alternative.file) return `[Imagem] ${alternative.file}`;
    return alternative.letter || 'Alternativa';
}

function resolveDisciplineLabel(disciplineValue, disciplines = []) {
    return disciplines.find((disc) => disc.value === disciplineValue)?.label || disciplineValue || 'Disciplina';
}

function resolveLanguageLabel(languageValue, languages = []) {
    if (!languageValue) return 'Português';
    return languages.find((lang) => lang.value === languageValue)?.label || languageValue;
}

function mapQuestion(details, examDetails) {
    const disciplineLabel = resolveDisciplineLabel(details.discipline, examDetails?.disciplines);
    const languageLabel = resolveLanguageLabel(details.language, examDetails?.languages);
    const options = (details.alternatives || []).map(buildOptionLabel);
    const correctOption = (details.alternatives || []).find((alt) => alt.isCorrect);
    const answer = correctOption ? buildOptionLabel(correctOption) : '';

    return {
        id: `${details.year}-${details.index}${details.language ? `-${details.language}` : ''}`,
        type: details.files?.length ? 'image' : 'text',
        interactionType: 'multiple-choice',
        subject: disciplineLabel,
        topic: `${disciplineLabel}: Questão ${details.index} (${languageLabel})`,
        preview: details.title || `Questão ${details.index}`,
        courseEdition: `ENEM ${details.year}`,
        durationMinutes: 3,
        difficulty: 'Média',
        content: {
            text: details.context || '',
            chartData: null,
            pyramidData: null,
            imageURL: details.files?.[0] || null,
            imageAlt: details.title || 'Figura da questão',
        },
        question: details.alternativesIntroduction || details.title || 'Selecione a alternativa correta.',
        options,
        answer,
    };
}

export async function fetchExamQuestions({ year, discipline, language }) {
    const examDetails = await fetchJson(getExamDetailsPath(year));

    const filteredQuestions = (examDetails.questions || []).filter((question) => {
        const matchesDiscipline = !discipline || question.discipline === discipline;
        const matchesLanguage = !language || question.language === language || question.language === null;
        return matchesDiscipline && matchesLanguage;
    });

    const questionPromises = filteredQuestions.map(async (question) => {
        const slug = question.language ? `${question.index}-${question.language}` : `${question.index}`;
        const details = await fetchJson(getQuestionDetailsPath(year, slug));
        return mapQuestion(details, examDetails);
    });

    return Promise.all(questionPromises);
}
