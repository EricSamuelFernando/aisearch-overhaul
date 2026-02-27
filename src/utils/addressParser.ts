/**
 * Parses city and state from a full address string
 * Example: "1961 California Street, San Francisco, CA 94109"
 * Returns: { city: "San Francisco", state: "CA" }
 */
export const parseAddressComponents = (unparsedAddress?: string) => {
    if (!unparsedAddress) {
        return { city: null, state: null };
    }

    console.log('Parsing address:', unparsedAddress);

    // Try different patterns
    // Pattern 1: "Street, City, STATE Zip" (most common)
    let match = unparsedAddress.match(/,\s*([^,]+),\s*([A-Z]{2})\s+\d{5}/);

    if (!match) {
        // Pattern 2: "Street, City STATE Zip" (no comma before state)
        match = unparsedAddress.match(/,\s*([^,]+)\s+([A-Z]{2})\s+\d{5}/);
    }

    if (match) {
        console.log('Match found:', { city: match[1].trim(), state: match[2].trim() });
        return {
            city: match[1].trim(),
            state: match[2].trim(),
        };
    }

    console.log('No match found');
    return { city: null, state: null };
};

/**
 * Gets state abbreviation from zip code
 * Comprehensive mapping of zip code prefixes to states
 */
const ZIP_TO_STATE: Record<string, string> = {
    // California (90-96)
    '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'CA',
    // New York (10-14)
    '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY',
    // Texas (75-79, 88)
    '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX', '88': 'TX',
    // Florida (32-34)
    '32': 'FL', '33': 'FL', '34': 'FL',
    // Illinois (60-62)
    '60': 'IL', '61': 'IL', '62': 'IL',
    // Pennsylvania (15-19)
    '15': 'PA', '16': 'PA', '17': 'PA', '18': 'PA', '19': 'PA',
    // Ohio (43-45)
    '43': 'OH', '44': 'OH', '45': 'OH',
    // Georgia (30-31)
    '30': 'GA', '31': 'GA',
    // North Carolina (27-28)
    '27': 'NC', '28': 'NC',
    // Michigan (48-49)
    '48': 'MI', '49': 'MI',
    // New Jersey (07-08)
    '07': 'NJ', '08': 'NJ',
    // Virginia (20-24)
    '20': 'VA', '21': 'MD', '22': 'VA', '23': 'VA', '24': 'VA',
    // Washington (98-99)
    '98': 'WA', '99': 'WA',
    // Massachusetts (01-02)
    '01': 'MA', '02': 'MA',
    // Arizona (85-86)
    '85': 'AZ', '86': 'AZ',
    // Tennessee (37-38)
    '37': 'TN', '38': 'TN',
    // Indiana (46-47)
    '46': 'IN', '47': 'IN',
    // Missouri (63-65)
    '63': 'MO', '64': 'MO', '65': 'MO',
    // Maryland (20-21)
    // '20': 'DC', '21': 'MD', // Already covered above
    // Wisconsin (53-54)
    '53': 'WI', '54': 'WI',
    // Colorado (80-81)
    '80': 'CO', '81': 'CO',
    // Minnesota (55-56)
    '55': 'MN', '56': 'MN',
};

export const getStateFromZip = (zipCode?: string): string | null => {
    if (!zipCode) return null;
    const prefix = zipCode.substring(0, 2);
    return ZIP_TO_STATE[prefix] || null;
};
