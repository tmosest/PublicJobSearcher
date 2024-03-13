import prompts from 'prompts';
import 'log-timestamp';

import { amazonCountries, amazonRegions, amazonCities } from '../constants/amazon_location_consts.mjs';
import { amazonCountryUrlParam, amazonRegionUrlParam, amazonCityUrlParam, amazonSearchUrlParam} from '../constants/amazon_url_constants.mjs';

export const amazonPrompts = await prompts([
    {
        type: 'multiselect',
        name: amazonCountryUrlParam,
        message: 'Select Country Codes',
        choices: amazonCountries,
        format: arr => arr.map(i => amazonCountries[i])
    },
    {
        type: 'multiselect',
        name: amazonRegionUrlParam,
        message: 'Select Region Name (Optional)',
        choices: amazonRegions,
        format: arr => arr.map(i => amazonRegions[i])
    },
    {
        type: 'multiselect',
        name: amazonCityUrlParam,
        message: 'Select City Names (Optional)',
        choices: amazonCities,
        format: arr => arr.map(i => amazonCities[i])
    },
    {
        type: 'text',
        name: amazonSearchUrlParam,
        message: 'Keywords for Search. E.G. "Front End Engineer" (Optional)'
    },
    {
        type: 'number',
        name: 'jobCount',
        initial: 25,
        message: 'How Many Jobs To Search? (Optional) (Defaults to all)'
    },
]);

