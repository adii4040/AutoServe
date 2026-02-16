import stringSimilarity from "string-similarity";
import { getOCRWorker } from './OCRWorker.utils.js'


function normalizeText(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // remove non-alphanumeric characters
        .replace(/\s+/g, " ") // collapse multiple spaces into one
        .trim();
}

export const verifyDocs = async (PANdocURL, PANcheckingData) => {  //AadhardocURL, userAddress
    try {
        const worker = await getOCRWorker();

        //console.log(PANdocURL, AadhardocURL)
        const panText = await worker.recognize(PANdocURL);
        //const aadharText = await worker.recognize(AadhardocURL);

        //console.log(panText.data.text)
        //console.log(aadharText.data.text)
        const { verified, confidenceScore, matchedFields } = crossCheckDocs(panText.data.text, PANcheckingData ) //aadharText.data.text, userAddress
        //console.log(verified, confidenceScore, matchedFields)
        return { verified, confidenceScore, matchedFields }

    } catch (err) {
        console.error(`Error while verifying the docs ${err}`);
        return { verified: false, error: err.message };
    }
}

const crossCheckDocs = (PANdocText, PANcheckingData) => { // AadhardocText, userAddress
    // Normalize all text
    const cleanPANText = normalizeText(PANdocText);
    //const cleanAadharText = normalizeText(AadhardocText);
    const cleanPANData = normalizeText(PANcheckingData);
    //const cleanAddress = normalizeText(userAddress);

    // 1️⃣ Check if valid PAN number format exists
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/i;
    const panFound = panRegex.test(PANdocText);

    // 2️⃣ Fuzzy match PAN text with given PAN data
    const panWords = cleanPANText.split(" ");
    let maxPANScore = getMaxPanScore(panWords, cleanPANData);



    // 3️⃣ Fuzzy match Aadhar text with user-provided address
    // const aadharWords = cleanAadharText.split(" ");
    // let maxAddressScore = getMaxAadharScore(aadharWords, cleanAddress);


    // 4️⃣ Combine all checks
    const verified = panFound && maxPANScore > 0.55 ; //&& maxAddressScore > 0.6

    return {
        verified,
        confidenceScore: {
            pan: (maxPANScore * 100).toFixed(2),
            //address: (maxAddressScore * 100).toFixed(2),
        },
        matchedFields: {
            panFound,
            panMatch: maxPANScore > 0.6,
            //addressMatch: maxAddressScore > 0.6,
        },
    };
}


const getMaxPanScore = (panWords, cleanPANData) => {
    let maxPANScore = 0;
    for (let i = 0; i < panWords.length - 2; i++) {
        const slice = `${panWords[i]} ${panWords[i + 1]} ${panWords[i + 2]}`;
        const score = stringSimilarity.compareTwoStrings(slice, cleanPANData);
        if (score > maxPANScore) maxPANScore = score;
    }

    return maxPANScore
}


const getMaxAadharScore = (aadharWords, cleanAddress) => {
    let maxAddressScore = 0;
    for (let i = 0; i < aadharWords.length - 3; i++) {
        const slice = `${aadharWords[i]} ${aadharWords[i + 1]} ${aadharWords[i + 2]} ${aadharWords[i + 3]}`;
        const score = stringSimilarity.compareTwoStrings(slice, cleanAddress);
        if (score > maxAddressScore) maxAddressScore = score;
    }

    return maxAddressScore;
}

