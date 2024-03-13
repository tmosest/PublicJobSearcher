export const amazonJobsBaseUrl = 'https://www.amazon.jobs/content/en/job-categories/software-development?employment-type%5B%5D=Full+time';
export const amazonCountryUrlParam = 'country';
export const amazonRegionUrlParam = 'region';
export const amazonCityUrlParam = 'city';
export const amazonSearchUrlParam = 'keyword';
export const amazonUrlEncodedPart = '%5B%5D=';
export const amazonUrlParams = [amazonCountryUrlParam, amazonRegionUrlParam, amazonCityUrlParam, amazonSearchUrlParam];

export function createUrlFromPrompt(promptResponses) {
    let url = `${amazonJobsBaseUrl}`;
    for (let [key, value] of Object.entries(promptResponses)) {

        if (!amazonUrlParams.includes(`${key}`) || value.length == 0) {
            continue;
        }

        if (Array.isArray(value)) {

            for (let v in value) {
                if (v.length == 0) {
                    continue;
                }
                url += `&${key}${amazonUrlEncodedPart}${value.toString().replace(' ', '+')}`.trim();
            }

            continue;
        }

        url += `&${key}${amazonUrlEncodedPart}${value.toString().replace(' ', '+')}`.trim();
    }
    return url;
} 
