/** Placeholder Cleveland-style values when user skips the form (report-led path). */
export const SKIP_CLINICAL_DEFAULTS = {
    age: "30",
    sex: "1",
    cp: "0",
    trestbps: "120",
    chol: "200",
    fbs: "0",
    restecg: "0",
    thalach: "150",
    exang: "0",
    oldpeak: "0",
    slope: "1",
    ca: "0",
    thal: "3",
};

export const REQUIRED_CLINICAL_KEYS = [
    "age",
    "trestbps",
    "chol",
    "thalach",
    "oldpeak",
];

export function hasRequiredClinicalParams(params) {
    if (!params || typeof params !== "object") return false;
    return REQUIRED_CLINICAL_KEYS.every(
        (k) => params[k] !== "" && params[k] != null
    );
}

/** Filled fields override defaults; used when OCR file is attached with incomplete form. */
export function mergeWithClinicalDefaults(bioData) {
    return { ...SKIP_CLINICAL_DEFAULTS, ...bioData };
}
