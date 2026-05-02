import stringSimilarity from "string-similarity";
import Tesseract from "tesseract.js";


/**
 * Normalize a string: lowercase, remove non-alphanumeric chars, collapse spaces.
 */
function normalizeText(str) {
    return String(str || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Build name variations to account for OCR noise and different orderings.
 * e.g. "Mohammad Safwan Khan" → ["mohammad safwan khan", "safwan khan", "mohammad khan", ...]
 */
function buildNameVariations(fullname) {
    const normalized = normalizeText(fullname);
    const parts = normalized.split(" ").filter(Boolean);
    const variations = new Set();

    // Full name as-is
    variations.add(normalized);

    if (parts.length >= 2) {
        // First + Last only
        variations.add(`${parts[0]} ${parts[parts.length - 1]}`);
        // Last + First (reversed)
        variations.add(`${parts[parts.length - 1]} ${parts[0]}`);
        // All parts in different combos
        for (let i = 0; i < parts.length; i++) {
            variations.add(parts[i]); // single part
            for (let j = i + 1; j < parts.length; j++) {
                variations.add(`${parts[i]} ${parts[j]}`); // 2-part combo
            }
        }
    } else {
        // Single-word name
        parts.forEach(p => variations.add(p));
    }

    return [...variations].filter(v => v.length > 2); // ignore tiny fragments
}

/**
 * Sliding-window fuzzy match: slide a window of nameWordCount words across
 * the OCR word list and return the best similarity score found.
 */
function slidingWindowMatch(ocrWords, nameVariation) {
    const nameWordCount = nameVariation.split(" ").length;
    let best = 0;

    // Slide window of same length as name variation
    for (let i = 0; i <= ocrWords.length - nameWordCount; i++) {
        const slice = ocrWords.slice(i, i + nameWordCount).join(" ");
        const score = stringSimilarity.compareTwoStrings(slice, nameVariation);
        if (score > best) best = score;
    }

    // Also try individual words against single-word variations
    if (nameWordCount === 1) {
        for (const word of ocrWords) {
            const score = stringSimilarity.compareTwoStrings(word, nameVariation);
            if (score > best) best = score;
        }
    }

    return best;
}

/**
 * Core name matching: checks how well the vendor's fullname appears in the OCR text.
 * Returns a score between 0 and 1.
 */
function matchNameInDocument(ocrRawText, fullname) {
    const ocrNormalized = normalizeText(ocrRawText);
    const ocrWords = ocrNormalized.split(" ").filter(Boolean);
    const nameVariations = buildNameVariations(fullname);

    let bestScore = 0;

    for (const variation of nameVariations) {
        const varWords = variation.split(" ");
        // Slide a window matching the variation's word count
        const score = slidingWindowMatch(ocrWords, variation);
        if (score > bestScore) bestScore = score;
    }

    return bestScore;
}

/**
 * Main verification export.
 * Runs OCR on PAN card and Aadhar card, then checks if the vendor's
 * submitted Full Name is present in either document.
 *
 * @param {string} PANdocPath   - Local file path to PAN card image
 * @param {string} AadharDocPath - Local file path to Aadhar card image
 * @param {string} fullname     - Vendor's full name as entered in the form
 */
export const verifyDocs = async (PANdocPath, AadharDocPath, fullname) => {
    try {
        // Run OCR on both documents in parallel
        const [panResult, aadharResult] = await Promise.all([
            Tesseract.recognize(PANdocPath, "eng").catch(() => null),
            Tesseract.recognize(AadharDocPath, "eng").catch(() => null),
        ]);

        const panText = panResult?.data?.text || "";
        const aadharText = aadharResult?.data?.text || "";

        console.log("=== PAN OCR TEXT ===\n", panText);
        console.log("=== AADHAR OCR TEXT ===\n", aadharText);
        console.log("=== FULLNAME TO MATCH ===", fullname);

        // Score name match in each document
        const panNameScore = matchNameInDocument(panText, fullname);
        const aadharNameScore = matchNameInDocument(aadharText, fullname);

        console.log(`PAN name match score: ${(panNameScore * 100).toFixed(1)}%`);
        console.log(`Aadhar name match score: ${(aadharNameScore * 100).toFixed(1)}%`);

        // Threshold: 0.45 (45%) similarity — lenient enough for OCR noise
        const NAME_MATCH_THRESHOLD = 0.45;
        const panNameMatched = panNameScore >= NAME_MATCH_THRESHOLD;
        const aadharNameMatched = aadharNameScore >= NAME_MATCH_THRESHOLD;

        // Pass if name is found in EITHER document
        const verified = panNameMatched || aadharNameMatched;

        return {
            verified,
            confidenceScore: {
                pan: (panNameScore * 100).toFixed(1),
                aadhar: (aadharNameScore * 100).toFixed(1),
            },
            matchedFields: {
                panNameMatched,
                aadharNameMatched,
            },
        };

    } catch (err) {
        console.error(`Error while verifying docs: ${err?.message || err}`);
        return {
            verified: false,
            error: "Unable to read uploaded documents. Please upload clear JPG/PNG images of your PAN card and Aadhar card.",
        };
    }
};
